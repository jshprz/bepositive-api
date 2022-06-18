import IPostShareRepository from "../infras/repositories/IPostShareRepository";
import IPostRepository from "../infras/repositories/IPostRepository";

import IUserRelationshipRepository from "../../../infras/repositories/IUserRelationshipRepository"; // External
import IFeedRepository from "../../feed-service/infras/repositories/IFeedRepository"; // External

import Logger from "../../../config/Logger";
import Error from '../../../config/Error';
import { QueryFailedError } from "typeorm";
import {getByIdAndUserCognitoSubReturnTypes, postType, sharedPostType} from "../../types";

class PostShareFacade {
    private _log;

    constructor(
        private _postShareRepository: IPostShareRepository,
        private _postRepository: IPostRepository,
        private _userRelationshipRepository: IUserRelationshipRepository,
        private _feedRepository: IFeedRepository
    ) {
        this._log = Logger.createLogger('PostShareFacade.ts');
    }

    /**
     * Checks the post existence and then creates a shared post.
     * @param postId: string
     * @param sharedPostAttr: { userId: string, postId: string, shareCaption: string }
     * @returns Promise<{ message: string, data: {}, code: number }>
     */
    createSharedPost(postId: string, sharedPostAttr: { userId: string, postId: string, shareCaption: string }): Promise<{
        message: string,
        data: {},
        code: number
    }> {

        return new Promise(async (resolve, reject) => {
            const post: postType | void = await this._postRepository.getPostById(postId).catch((error: QueryFailedError) => {
                this._log.error({
                    function: 'createSharedPost()',
                    message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                    payload: { postId, sharedPostAttr }
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

            if (post && !post.content.postId) {
                return reject({
                    message: 'Post not found',
                    code: 404
                });
            }

            const sharedPost = await this._postShareRepository.create(sharedPostAttr).save().catch((error: QueryFailedError) => {
                this._log.error({
                    function: 'createSharedPost()',
                    message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                    payload: { postId, sharedPostAttr }
                });

                return reject({
                    message: Error.DATABASE_ERROR.CREATE,
                    code: 500
                })
            });

            const userRelationships = await this._userRelationshipRepository.get(false, sharedPostAttr.userId).catch((error: QueryFailedError) => {
                this._log.error({
                    function: 'createSharedPost()',
                    message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                    payload: { postId, sharedPostAttr }
                });

                return reject({
                    message: Error.DATABASE_ERROR.GET,
                    code: 500
                });
            });

            // If the followers is not an array, it should be an error.
            if (Array.isArray(userRelationships) && sharedPost) {

                // Allow users to see their own post within their feed.
                userRelationships.push({
                    id: '',
                    followeeId: '',
                    followerId: sharedPostAttr.userId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    deletedAt: new Date()
                });

                // After creating the post we distribute it to the followers of the user who created it.
                for (const userRelationship of userRelationships) {
                    await this._feedRepository.create(userRelationship.followerId, String(sharedPost.id), false)
                        .save()
                        .catch((error: QueryFailedError) => {
                            this._log.error({
                                function: 'createSharedPost()',
                                message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                                payload: { postId, sharedPostAttr }
                            });

                            return reject({
                                message: Error.DATABASE_ERROR.CREATE,
                                code: 500
                            });
                        });
                }

                return resolve({
                    message: 'The post successfully shared',
                    data: {},
                    code: 200
                });
            } else {
                this._log.error({
                    function: 'createSharedPost()',
                    message: `An error occurred while retrieving the user relationships: ${userRelationships}`,
                    payload: { postId, sharedPostAttr }
                });

                return reject({
                    message: 'An error occurred while retrieving the followers',
                    code: 500
                });
            }
        });
    }

    /**
     * Gets a shared post by ID.
     * @param postId: string
     * @returns Promise<{
     *         message: string,
     *         data: {
     *             id: string,
     *             postId: string,
     *             userId: string,
     *             shareCaption: string,
     *             createdAt: Date | number,
     *             updatedAt: Date | number
     *         },
     *         code: number
     *     }>
     */
    getSharedPostById(postId: string): Promise<{
        message: string,
        data: {
            id: string,
            postId: string,
            userId: string,
            shareCaption: string,
            createdAt: Date | number,
            updatedAt: Date | number
        },
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            const sharedPost: sharedPostType | void = await this._postShareRepository.get(postId).catch((error: string & QueryFailedError) => {
               this._log.error({
                   function: 'getSharedPostById()',
                   message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                   payload: {postId}
               });

               if (error === 'SHARED_POST_NOT_FOUND' || error.message.includes('invalid input syntax for type uuid')) {
                   return reject({
                        message: 'Shared post not found',
                        code: 404
                   });
               }

               return reject({
                   message: Error.DATABASE_ERROR.GET,
                   code: 500
               });
            });

            if (!sharedPost) {
                return reject({
                    message: 'Shared post not found',
                    code: 404
                });
            }

            return resolve({
                message: `Shared post with an id of ${postId} has been successfully retrieved`,
                data: sharedPost,
                code: 200
            });
        });
    }

    /**
     * Checks the existence of the shared post via id and userCognitoSub and then updates it.
     * @param id: string
     * @param userCognitoSub: string
     * @param shareCaption: string
     * @returns Promise<{
     *         message: string,
     *         data: {},
     *         code: number
     *     }>
     */
    updateSharedPost(id: string, userCognitoSub: string, shareCaption: string): Promise<{
        message: string,
        data: {},
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            // Check the existence of the shared post by getting it via its id and user_id.
            const sharedPost: getByIdAndUserCognitoSubReturnTypes | void = await this._postShareRepository.getByIdAndUserCognitoSub(id, userCognitoSub).catch((error: QueryFailedError) => {
                this._log.error({
                    function: 'updateSharedPost()',
                    message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                    payload: {
                        id,
                        userCognitoSub,
                        shareCaption
                    }
                });

                if (error.message.includes('invalid input syntax for type uuid')) {
                    return reject({
                        message: 'Shared post not found',
                        code: 404
                    });
                }

                return reject({
                    message: Error.DATABASE_ERROR.GET,
                    code: 500
                });
            });

            if (!sharedPost || (sharedPost && (!sharedPost.id || sharedPost.id == '')) || userCognitoSub !== sharedPost.userId) {
                return reject({
                    message: 'Shared post not found',
                    code: 404
                });
            }

            await this._postShareRepository.update(id, shareCaption).catch((error: QueryFailedError) => {
                this._log.error({
                    function: 'updateSharedPost()',
                    message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                    payload: {
                        id,
                        userCognitoSub,
                        shareCaption
                    }
                });

                return reject({
                    message: Error.DATABASE_ERROR.UPDATE,
                    code: 500
                });
            });

            return resolve({
                message: 'The shared post has been updated successfully',
                data: {
                    updatedItem: {
                        shareCaption
                    }
                },
                code: 200
            });
        });
    }
}

export default PostShareFacade;