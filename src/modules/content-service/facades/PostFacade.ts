import IAwsS3 from "../infras/aws/IAwsS3";
import IPostRepository from "../infras/repositories/IPostRepository";
import IPostLikeRepository from "../infras/repositories/IPostLikeRepository";
import Logger from '../../../config/Logger';
import Error from '../../../config/Error';
import { Client } from '@googlemaps/google-maps-services-js';

import IUserRelationshipRepository from "../../user-service/infras/repositories/IUserRelationshipRepository"; // External
import IFeedRepository from "../../feed-service/infras/repositories/IFeedRepository"; // External

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
     * @returns Promise<string[]>
     */
    createPost(item: {userCognitoSub: string, caption: string, files: {key: string, type: string}[], googlemapsPlaceId: string }): Promise<string[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const promises: string[] = [];
                item.files.forEach((file: {key: string, type: string}) => {
                    promises.push(this._awsS3.presignedPutUrl(file.key, file.type, 'public-read'));
                });

                const post = await this._postRepository.create(item).save().catch((error) => {
                    this._log.error({
                        message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                        payload: item
                    });

                    return reject(Error.DATABASE_ERROR.CREATE);
                });

                const followers = await this._userRelationshipRepository.get(true, item.userCognitoSub).catch((error) => {
                    this._log.error({
                        message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                        payload: item
                    });

                    return reject(Error.DATABASE_ERROR.GET);
                });

                followers.forEach((follower) => {
                    const userId = follower.user_relationships_user_id;
                    promises.push(this._feedRepository.create(userId, post.id).save());
                });

                Promise.all(promises).then(async (result: string[]) => {
                    return resolve(result);
                });
            } catch (error) {
                this._log.error({
                    message: error,
                    payload: item
                });

                return reject('There was an error that occurred upon creating a post.');
            }
        });
    }

    /**
     * Get all the posts of the user by their cognito sub.
     * @param userCognitoSub: string
     * @returns Promise<any[]>
     */
    getPostsByUser(userCognitoSub: string): Promise<any[]> {
        return new Promise(async (resolve, reject) => {
            const posts = await this._postRepository.getPostsByUserCognitoSub(userCognitoSub).catch((error) => {
                this._log.error({
                    message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                    payload: { userCognitoSub }
                });

                return reject(Error.DATABASE_ERROR.GET);
            });

            const processPosts = posts.map((post) => {
                const { posts_id, posts_s3_files } = post;

                posts_s3_files[0].key = `${process.env.AWS_S3_BUCKET_URL}/${posts_s3_files[0].key}`; // S3 object file URL.

                return {
                    id: posts_id,
                    post_media_file: posts_s3_files[0]
                };
            });

            return resolve(processPosts);
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
                    payload: { id }
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
                post.s3_files.forEach((file) => {
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
                    payload: { id }
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
     * @returns Promise<void | {
     *         message: string,
     *         data: boolean,
     *         code: number
     *     }>
     */
    likeOrUnlikePost(postId: number, userCognitoSub: string): Promise<void | {
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

               return resolve(unlikeResult);
           } else {
               const likeResult = await this._likePost(postId, userCognitoSub).catch((error) => {
                  return reject(error);
               });

               return resolve(likeResult);
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
           await this._postLikeRepository.create({userCognitoSub, postId}).save().catch((error) => {
               this._log.error({
                   message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
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
}

export default PostFacade;