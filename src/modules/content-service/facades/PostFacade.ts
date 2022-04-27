import IAwsS3 from "../infras/aws/IAwsS3";
import IPostRepository from "../infras/repositories/IPostRepository";
import IPostLikeRepository from "../infras/repositories/IPostLikeRepository";
import Logger from '../../../config/Logger';
import Error from '../../../config/Error';
import { Client } from '@googlemaps/google-maps-services-js';

import IUserRelationshipRepository from "../../user-service/infras/repositories/IUserRelationshipRepository"; // External
import IFeedRepository from "../../feed-service/infras/repositories/IFeedRepository"; // External

import { QueryFailedError } from "typeorm";
import type { postType, sharedPostType } from '../../types';

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
        data: { uploadSignedURLs: string[] },
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            const preSignedURLPromises: Promise<string>[] = [];

            // Collect the pre-signed urls promises and resolve them later.
            item.files.forEach((file: {key: string, type: string}) => {
                preSignedURLPromises.push(this._awsS3.presignedPutUrl(file.key, file.type, 'public-read'));
            });

            Promise.allSettled(preSignedURLPromises).then(async (results) => {
                const resultsMap = results.map((result) => {
                    if (result.status !== 'rejected') {
                        return result.value
                    }

                    this._log.error({
                        function: 'createPost() & presignedPutUrl()',
                        message: result.reason.toString(),
                        payload: item
                    });

                    return '';
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
                        id: '',
                        followeeId: '',
                        followerId: item.userCognitoSub,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        deletedAt: new Date()
                    });

                    // After creating the post we distribute it to the followers of the user who created it.
                    for (const userRelationship of userRelationships) {
                        await this._feedRepository.createFeedForRegularPost(userRelationship.followerId, String(post.id))
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
                        data: {
                            uploadSignedURLs: resultsMap.filter(result => result !== '')
                        },
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
            const posts: postType[] | void = await this._postRepository.getPostsByUserCognitoSub(userCognitoSub).catch((error: QueryFailedError) => {
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

                Promise.allSettled(promises).then((results) => {
                    const tempPostData = {
                        id: '',
                        userId: '',
                        caption: '',
                        status: '',
                        viewCount: 0,
                        googleMapsPlaceId: '',
                        locationDetails: '',
                        postMediaFiles: [{
                            key: '',
                            type: ''
                        }],
                        createdAt: 0,
                        updatedAt: 0
                    };
                    const resultsMap = results.map(r => r.status !== 'rejected'? r.value : tempPostData);

                    return resolve({
                        message: 'Posts successfully retrieved',
                        data: resultsMap.filter(r => r.id !== '' && r.userId !== ''),
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
     * @param id: string
     * @returns Promise<{
     *   message: string,
     *   data: postType,
     *   code: number
     * }>
     */
    getPostById(id: string): Promise<{
        message: string,
        data: postType,
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            const post: postType | void = await this._postRepository.getPostById(id).catch((error: QueryFailedError) => {
                this._log.error({
                    function: 'getPostById()',
                    message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                    payload: { id }
                });

                if (error.message.includes('invalid input syntax for type uuid')) {
                    return reject({
                        message: 'Post not found.',
                        code: 404
                    });
                }

                return reject({
                    message: Error.DATABASE_ERROR.GET,
                    code: 500
                });
            });

            if (post && post.id && post.id !== '') {
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
                    post.postMediaFiles.forEach((file: { key: string; }) => {
                        file.key = `${process.env.AWS_S3_BUCKET_URL}/${file.key}`; // S3 object file URL.
                    });
                }

                return resolve({
                    message: 'Post retrieved',
                    data: post,
                    code: 200
                });
            } else {
                this._log.info({
                    function: 'getPostById()',
                    message: 'Post retrieval info',
                    payload: { id }
                });

                return reject({
                    message: 'Post not found',
                    code: 404
                });
            }
        });
    }

    /**
     * Update the caption of the post.
     * @param userId: string
     * @param id: string
     * @param caption: string
     * @returns Promise<{
     *   message: string,
     *   data: {},
     *   code: number
     * }>
     */
    updatePost(userId: string, id: string, caption: string): Promise<{
        message: string,
        data: {},
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            const post: postType | void = await this._postRepository.getPostById(id).catch((error: QueryFailedError) => {
                this._log.error({
                    function: 'updatePost()',
                    message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                    payload: {
                        userId,
                        id,
                        caption
                    }
                });

                if (error.message.includes('invalid input syntax for type uuid')) {
                    return reject({
                        message: 'Post not found.',
                        code: 404
                    });
                }

                return reject({
                    message: Error.DATABASE_ERROR.GET,
                    code: 500
                });
            });

            if (!post || (post && (!post.id || post.id == '')) || userId !== post.userId) {
                return reject({
                    message: 'Post not found.',
                    code: 404
                });
            }

            await this._postRepository.update(id, caption);

            return resolve({
                message: 'The post was updated successfully.',
                data: {},
                code: 200
            });
        });
    }

    /**
     * Remove a post by ID.
     * @param userId: string
     * @param id: string
     * @returns Promise<{
     *   message: string,
     *   data: {},
     *   code: number
     * }>
     */
    removePost(userId: string, id: string): Promise<{
        message: string,
        data: {},
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            const post: postType | void = await this._postRepository.getPostById(id).catch((error: QueryFailedError) => {
                this._log.error({
                    function: 'removePost()',
                    message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                    payload: {
                        userId,
                        id
                    }
                });

                if (error.message.includes('invalid input syntax for type uuid')) {
                    return reject({
                        message: 'Post not found.',
                        code: 404
                    });
                }

                return reject({
                    message: Error.DATABASE_ERROR.GET,
                    code: 500
                });
            });

            if (!post || (post && (!post.id || post.id == '')) || userId !== post.userId) {
                return reject({
                    message: 'Post not found.',
                    code: 404
                });
            }

            await this._postRepository.softDelete(id).catch((error: QueryFailedError) => {
                this._log.error({
                    function: 'removePost()',
                    message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                    payload: {
                        userId,
                        id
                    }
                });

                return reject({
                    message: Error.DATABASE_ERROR.UPDATE,
                    code: 500
                });
            });

            return resolve({
                message: 'The post was successfully deleted.',
                data: {},
                code: 200
            });
        });
    }

    /**
     * To like or unlike a post.
     * @param postId: string
     * @param userCognitoSub: string
     * @param like: boolean
     * @param classification: string
     * @returns Promise<{
     *         message: string,
     *         data: {isLiked: boolean},
     *         code: number
     *     }>
     */
    likeOrUnlikePost(postId: string, userCognitoSub: string, like: boolean, classification: string): Promise<{
        message: string,
        data: {isLiked: boolean},
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            if (classification == "REGULAR_POST") {
                const post = await this._postRepository.getPostById(postId).catch((error) => {
                    this._log.error({
                        function: 'likeOrUnlikePost()',
                        message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                        payload: {
                            postId,
                            like,
                            userCognitoSub
                        }
                    });

                    if (error.message.includes('invalid input syntax for type uuid')) {
                        return reject({
                            message: 'Post not found.',
                            code: 404
                        });
                    }

                    return reject({
                        message: Error.DATABASE_ERROR.GET,
                        code: 500
                    });
                });

                // check if post exists first.
                if (!post || (post && post.id == "" ) || (post && !post.id)) {
                    return reject({
                        message: 'Post does not exist.',
                        code: 404
                    });
                }
            } else {
                // we're dealing with a share post
                const post = await this._postRepository.getSharedPostById(postId).catch((error) => {
                    this._log.error({
                        function: 'likeOrUnlikePost()',
                        message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                        payload: {
                            postId,
                            like,
                            userCognitoSub
                        }
                    });

                    if (error.message.includes('invalid input syntax for type uuid')) {
                        return reject({
                            message: 'Shared post not found.',
                            code: 404
                        });
                    }

                    return reject({
                        message: Error.DATABASE_ERROR.GET,
                        code: 500
                    });
                });

                // check if post exists first.
                if (!post || (post && post.id == "" ) || (post && !post.id)) {
                    return reject({
                        message: 'Post does not exist.',
                        code: 404
                    });
                }
            }

            // check if user has already liked or unliked the post
            const postLiked = await this._postLikeRepository.getByIdAndUserId(postId, userCognitoSub).catch((error) => {
                this._log.error({
                    function: 'likeOrUnlikePost()',
                    message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                    payload: {
                        postId,
                        userCognitoSub
                    }
                });
            });

            if (like && postLiked) {
                return reject({
                    message: "Post already liked.",
                    code: 400
                });
            } else if (!like && !postLiked) {
                return reject({
                    message: "Post already unliked.",
                    code: 400
                });
            }

            // create or delete a record in the database depending on the value of the like parameter.
            if (like) {
                const likeResult = await this._likePost(postId, userCognitoSub, classification).catch((error) => {
                    return reject(error);
                });

                if (likeResult) {
                    return resolve({
                        message: 'Post successfully liked.',
                        data: {isLiked: true},
                        code: 200
                    });
                }
           } else {
                const unlikeResult = await this._unlikePost(postId, userCognitoSub).catch((error) => {
                    return reject(error);
                });

                if (unlikeResult) {
                    return resolve({
                        message: 'Post successfully unliked.',
                        data: {isLiked: false},
                        code: 200
                    });
                }
           }
        });
    }

    /**
     * To like a post.
     * @param postId: string
     * @param userCognitoSub: string
     * @param classification: string
     * @returns Promise<{
     *         message: string,
     *         data: boolean,
     *         code: number
     *     }>
     */
    private _likePost(postId: string, userCognitoSub: string, classification: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
           await this._postLikeRepository.create(userCognitoSub, postId, classification).save().catch((error: QueryFailedError) => {
               this._log.error({
                   function: '_likePost()',
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

           resolve(true);
        });
    }

    /**
     * To unlike a post.
     * @param postId: string
     * @param userCognitoSub: string
     * @returns Promise<{
     *         message: string,
     *         data: boolean,
     *         code: number
     *     }>
     */
    private _unlikePost(postId: string, userCognitoSub: string): Promise<boolean> {
        return new Promise(async (resolve,reject) => {
            await this._postLikeRepository.deleteByIdAndUserId(postId, userCognitoSub).catch((error) => {
                this._log.error({
                    function: '_unlikePost()',
                    message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                    payload: {
                        postId,
                        userCognitoSub
                    }
                });

                return reject(Error.DATABASE_ERROR.DELETE);
            });

            resolve(true);
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

    /**
     * Flag a post by another user
     * @param userId: string
     * @param postId: string
     * @param classification: string
     * @param reason: string
     * @returns Promise<{
     *   message: string,
     *   data: {},
     *   code: number
     * }>
     */
    flagPost(userId: string, postId: string, classification: string, reason: string): Promise<{
            message: string,
            data: {},
            code: number
        }> {
            return new Promise(async (resolve, reject) => {
                let post: postType | sharedPostType | void;
                if (classification === "REGULAR_POST") {
                    post = await this._postRepository.getPostById(postId).catch((error: QueryFailedError) => {
                        this._log.error({
                            function: 'flagPost()',
                            message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                            payload: {
                                userId,
                                postId,
                                classification,
                                reason
                            }
                        });

                        if (error.message.includes('invalid input syntax for type uuid')) {
                            return reject({
                                message: 'Post not found.',
                                code: 404
                            });
                        }

                        return reject({
                            message: Error.DATABASE_ERROR.GET,
                            code: 500
                        });
                    });
                } else {
                    // get shared post
                    post = await this._postRepository.getSharedPostById(postId
                        ).catch((error: QueryFailedError) => {
                        this._log.error({
                            function: 'flagPost()',
                            message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                            payload: {
                                userId,
                                postId,
                                classification,
                                reason
                            }
                        });

                        if (error.message.includes('invalid input syntax for type uuid')) {
                            return reject({
                                message: 'Shared post not found.',
                                code: 404
                            });
                        }

                        return reject({
                            message: Error.DATABASE_ERROR.GET,
                            code: 500
                        });
                    });
                }

                if (!post || (post && (!post.id || post.id == ''))) {
                    return reject({
                        message: 'Post not found.',
                        code: 404
                    });
                }

                // do not permit users to report their own posts
                if (post && post.userId === userId) {
                    return reject({
                        message: 'Reporting of own posts is not permitted.',
                        code: 401
                    });
                }

                await this._postRepository.flagPost(userId, postId, classification, reason).save().catch((error: QueryFailedError) => {
                    this._log.error({
                        function: 'flagPost()',
                        message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                        payload: {userId, postId, classification, reason}
                    });

                    return reject({
                        message: error.message,
                        code: 500
                    });
                });

                return resolve({
                    message: 'The post was reported successfully.',
                    data: {},
                    code: 200
                });
            });
        }
}

export default PostFacade;