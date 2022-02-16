import IAwsS3 from "../infras/aws/IAwsS3";
import IPostRepository from "../infras/repositories/IPostRepository";
import IPostLikeRepository from "../infras/repositories/IPostLikeRepository";
import Logger from '../../../config/Logger';
import Error from '../../../config/Error';
import { Client } from '@googlemaps/google-maps-services-js';

import IUserRelationshipRepository from "../../user-service/infras/repositories/IUserRelationshipRepository"; // External
import IFeedRepository from "../../feed-service/infras/repositories/IFeedRepository"; // External

import { QueryFailedError } from "typeorm";

type postType = {
    id: number,
    userId: string,
    caption: string,
    status: string,
    viewCount: number,
    googleMapsPlaceId: string,
    locationDetails: string,
    postMediaFiles: {key: string, type: string}[],
    createdAt: number,
    updatedAt: number,
    deletedAt: number
}

class PostFacade {
    private _log;
    private _googleapis;

    constructor(
        private _awsS3: IAwsS3,
        private _postRepository: IPostRepository,
        private _postLikeRepository: IPostLikeRepository,
        private _userRelationshipRepository: IUserRelationshipRepository,
        private _feedRepository: IFeedRepository
    ) {

        this._log = Logger.createLogger('PostFacade.ts');
        this._googleapis = new Client({});
    }

    /**
     * Creates a post.
     * @param item: { userCognitoSub: string, caption: string, files: {key: string, type: string}[], googlemapsPlaceId: string }
     * @returns Promise<{
     *         message: string,
     *         data: string[],
     *         code: number
     *     }>
     */
    createPost(item: {userCognitoSub: string, caption: string, files: {key: string, type: string}[], googlemapsPlaceId: string }): Promise<{
        message: string,
        data: string[],
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            const preSignedURLPromises: any[] = [];

            // Collect the pre-signed urls promises and resolve them later.
            item.files.forEach((file: {key: string, type: string}) => {
                preSignedURLPromises.push(this._awsS3.presignedPutUrl(file.key, file.type, 'public-read'));
            });

            const preSignedUrls = await Promise.all(preSignedURLPromises).catch((error: string) => {
                this._log.error({
                    function: 'createPost()',
                    message: error.toString(),
                    payload: item
                });

                return reject({
                    message: 'Error in generating pre-signed URL/s.',
                    code: 500
                });
            });

            const post = await this._postRepository.create(item).save().catch((error: QueryFailedError) => {
                this._log.error({
                    function: 'createPost()',
                    message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                    payload: item
                });

                return reject({
                    message: Error.DATABASE_ERROR.CREATE,
                    code: 500
                });
            });

            const userRelationships = await this._userRelationshipRepository.get(false, item.userCognitoSub).catch((error: QueryFailedError) => {
                this._log.error({
                    function: 'createPost()',
                    message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                    payload: item
                });

                return reject({
                    message: Error.DATABASE_ERROR.GET,
                    code: 500
                });
            });

            // If the followers is not an array, it should be an error.
            if (Array.isArray(userRelationships) && post) {

                // Allow users to see their own post within their feed.
                userRelationships.push({
                    id: 0,
                    followeeId: '',
                    followerId: item.userCognitoSub,
                    createdAt: 0,
                    updatedAt: 0,
                    deletedAt: 0
                });

                // After creating the post we distribute it to the followers of the user who created it.
                for (const userRelationship of userRelationships) {
                    await this._feedRepository.create(userRelationship.followerId, Number(post.id))
                        .save()
                        .catch((error: QueryFailedError) => {
                            this._log.error({
                                function: 'createPost()',
                                message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                                payload: item
                            });

                            return reject({
                                message: Error.DATABASE_ERROR.CREATE,
                                code: 500
                            });
                        });
                }

                return resolve({
                    message: 'Post created successfully.',
                    data: (Array.isArray(preSignedUrls))? preSignedUrls : [],
                    code: 200
                });
            } else {
                this._log.error({
                    function: 'createPost()',
                    message: `An error occurred while retrieving the user relationships: ${userRelationships}`,
                    payload: item
                });

                return reject({
                    message: 'An error occurred while retrieving the followers',
                    code: 500
                });
            }
        });
    }

    /**
     * Get all the posts of the user by their cognito sub.
     * @param userCognitoSub: string
     * @returns Promise<{
     *         message: string,
     *         data: postType[],
     *         code: number
     *     }>
     */
    getPostsByUser(userCognitoSub: string): Promise<{
        message: string,
        data: postType[],
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            const posts = await this._postRepository.getPostsByUserCognitoSub(userCognitoSub).catch((error: QueryFailedError) => {
                this._log.error({
                    function: 'getPostsByUser()',
                    message: error.toString(),
                    payload: { userCognitoSub }
                });

                return reject({
                    message: error,
                    code: 500
                });
            });

            // We expect the posts to be an array, other types are not allowed.
            if (Array.isArray(posts)) {

                const promises: Promise<postType>[] = [];

                // To add a location details and complete URL of the S3 file key on each of the post within the post gallery.
                posts.forEach((post) => {
                    promises.push(this._processPostsLocationAndMediaFiles(post));
                });

                Promise.all(promises).then((result) => {
                    return resolve({
                        message: 'Posts successfully retrieved',
                        data: result,
                        code: 200
                    });
                });
            } else {
                return reject({
                    message: 'invalid type for posts gallery',
                    code: 500
                });
            }
        });
    }

    /**
     * Get a post by its ID.
     * @param id: number
     * @returns Promise<any>
     */
    getPostById(id: number): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const post = await this._postRepository.getPostById(id).catch((error) => {
                this._log.error({
                    message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                    payload: {id}
                });

                return reject(Error.DATABASE_ERROR.GET);
            });

            if (post?.google_maps_place_id) {
                // Retrieve post location details
                const place = await this._googleapis.placeDetails({
                    params: {
                        place_id: post.google_maps_place_id,
                        key: `${process.env.GOOGLE_MAPS_API_KEY}`
                    }
                }).catch((error) => {
                    throw error.stack;
                });
                post.location_details = `${place.data.result.name}, ${place.data.result.vicinity}`;
            }

            if (post?.s3_files) {
                post.s3_files.forEach((file: { key: string; }) => {
                    file.key = `${process.env.AWS_S3_BUCKET_URL}/${file.key}`; // S3 object file URL.
                });
            }

            return resolve(post);
        });
    }

    /**
     * Update the caption of the post.
     * @param id: number
     * @param caption: string
     * @returns Promise<string>
     */
    updatePost(id: number, caption: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            const post = await this._postRepository.getPostById(id).catch((error) => {
                this._log.error({
                    message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                    payload: {
                        id,
                        caption
                    }
                });

                return reject(Error.DATABASE_ERROR.GET);
            });

            if (!post) {
                return reject('Post not found.');
            }

            await this._postRepository.update(id, caption);

            return resolve('The post was updated successfully.');
        });
    }

    /**
     * Remove a post by ID.
     * @param id
     * @returns Promise<boolean>
     */
    removePost(id: number): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            await this._postRepository.removePostById(id).catch((error) => {
                this._log.error({
                    message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                    payload: {id}
                });

                return reject(Error.DATABASE_ERROR.UPDATE);
            });

            return resolve(true);
        });
    }

    /**
     * To like or unlike a post.
     * @param postId
     * @param userCognitoSub
     * @returns Promise<{
     *         message: string,
     *         data: { liked: boolean } | { unliked: boolean },
     *         code: number
     *     }>
     */
    likeOrUnlikePost(postId: number, userCognitoSub: string): Promise<{
        message: string,
        data: { liked: boolean } | { unliked: boolean },
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
           const post = await this._postRepository.getPostById(postId).catch((error) => {
               this._log.error({
                   message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                   payload: {
                       postId,
                       userCognitoSub
                   }
               });

               return reject({
                   message: Error.DATABASE_ERROR.GET,
                   code: 500
               });
           });

           // check if post exists first.
           if (!post) {
               return reject({
                   message: 'Post does not exist.',
                   code: 404
               });
           }

           const liked = await this._postLikeRepository.getByIdAndUserId(postId, userCognitoSub).catch((error) => {
               this._log.error({
                   message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                   payload: {
                       postId,
                       userCognitoSub
                   }
               });

               return reject({
                   message: Error.DATABASE_ERROR.GET,
                   code: 500
               });
           });

           // check if the user has already liked the post
           if (liked) {
               const unlikeResult = await this._unlikePost(postId, userCognitoSub).catch((error) => {
                  return reject(error);
               });

               if (unlikeResult && unlikeResult.message && unlikeResult.data && unlikeResult.code) {
                   return resolve(unlikeResult);
               }

           } else {
               const likeResult = await this._likePost(postId, userCognitoSub).catch((error) => {
                  return reject(error);
               });

               if (likeResult && likeResult.message && likeResult.data && likeResult.code) {
                   return resolve(likeResult);
               }
           }
        });
    }

    /**
     * To like a post.
     * @param postId
     * @param userCognitoSub
     * @returns Promise<{
     *         message: string,
     *         data: {
     *             liked: boolean
     *         },
     *         code: number
     *     }>
     */
    private _likePost(postId: number, userCognitoSub: string): Promise<{
        message: string,
        data: {
            liked: boolean
        },
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
           await this._postLikeRepository.create({userCognitoSub, postId}).save().catch((error: QueryFailedError) => {
               this._log.error({
                   message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                   payload: {
                       postId,
                       userCognitoSub
                   }
               });

               return reject({
                   message: Error.DATABASE_ERROR.CREATE,
                   code: 500
               });
           });

           return resolve({
               message: 'Post successfully liked.',
               data: {
                   liked: true
               },
               code: 200
           });
        });
    }

    /**
     * To unlike a post.
     * @param postId
     * @param userCognitoSub
     * @returns Promise<{
     *         message: string,
     *         data: {
     *             unliked: boolean
     *         },
     *         code: number
     *     }>
     */
    private _unlikePost(postId: number, userCognitoSub: string): Promise<{
        message: string,
        data: {
            unliked: boolean
        },
        code: number
    }> {
        return new Promise(async (resolve,reject) => {
            await this._postLikeRepository.deleteByIdAndUserId(postId, userCognitoSub).catch((error) => {
                this._log.error({
                    message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                    payload: {
                        postId,
                        userCognitoSub
                    }
                });

                return reject(Error.DATABASE_ERROR.DELETE);
            });

            return resolve({
                message: 'Post successfully unliked.',
                data: {
                    unliked: true
                },
                code: 200
            });
        });
    }

    /**
     * To add a location details and complete URL of the S3 file key on a post object.
     * @param post: postType
     * @private Promise<postType>
     */
    private async _processPostsLocationAndMediaFiles(post: postType): Promise<postType> {
        if (post.googleMapsPlaceId) {
            // Retrieve post location details
            const place = await this._googleapis.placeDetails({
                params: {
                    place_id: post.googleMapsPlaceId,
                    key: `${process.env.GOOGLE_MAPS_API_KEY}`
                }
            }).catch((error) => {
                throw error.stack;
            });
            post.locationDetails = `${place.data.result.name}, ${place.data.result.vicinity}`;
        }

        if (post.postMediaFiles) {
            post.postMediaFiles.forEach((file) => {
                file.key = `${process.env.AWS_S3_BUCKET_URL}/${file.key}`; // S3 object file URL.
            });
        }

        return post;
    }
}

export default PostFacade;