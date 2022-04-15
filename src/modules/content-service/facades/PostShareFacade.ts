import IPostShareRepository from "../infras/repositories/IPostShareRepository";
import IPostRepository from "../infras/repositories/IPostRepository";
import Logger from "../../../config/Logger";
import Error from '../../../config/Error';
import { QueryFailedError } from "typeorm";

class PostShareFacade {
    private _log;

    constructor(private _postShareRepository: IPostShareRepository, private _postRepository: IPostRepository) {
        this._log = Logger.createLogger('PostShareFacade.ts');
    }

    /**
     * Checks the post existence and then creates a shared post.
     * @param postId: number
     * @param sharedPostAttr: { userId: string, postId: number, shareCaption: string }
     * @returns Promise<{ message: string, data: {}, code: number }>
     */
    createSharedPost(postId: number, sharedPostAttr: { userId: string, postId: number, shareCaption: string }): Promise<{
        message: string,
        data: {},
        code: number
    }> {

        return new Promise(async (resolve, reject) => {
            const post = await this._postRepository.getPostById(postId).catch((error: QueryFailedError) => {
                this._log.error({
                    function: 'createSharedPost()',
                    message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                    payload: {
                        postId,
                        sharedPostAttr
                    }
                });

                return reject({
                    message: Error.DATABASE_ERROR.GET,
                    code: 500
                });
            });

            if (post && !post.id) {
                return reject({
                    message: 'Post not found',
                    code: 404
                });
            }

            await this._postShareRepository.create(sharedPostAttr).save().catch((error: QueryFailedError) => {
                this._log.error({
                    message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                    payload: {sharedPostAttr}
                });

                return reject({
                    message: Error.DATABASE_ERROR.CREATE,
                    code: 500
                })
            });

            return resolve({
                message: 'The post successfully shared',
                data: {},
                code: 200
            });
        });
    }

    /**
     * Gets a shared post by ID.
     * @param postId: number
     * @returns Promise<{
     *  message: string,
     *  data: {
     *      id: number,
     *      post_id: number,
     *      user_id: string,
     *      share_caption: string,
     *      created_at: number
     *  },
     *  code: number
     * }>
     */
    getSharedPostById(postId: number): Promise<{
        message: string,
        data: {
            id: number,
            postId: number,
            userId: string,
            shareCaption: string,
            createdAt: Date | number,
            updatedAt: Date | number
        },
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            const sharedPost = await this._postShareRepository.get(postId).catch((error) => {
               this._log.error({
                   message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                   payload: {postId}
               });

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
                data: {
                    id: sharedPost.id,
                    postId: sharedPost.post_id,
                    userId: sharedPost.user_id,
                    shareCaption: sharedPost.share_caption,
                    createdAt: sharedPost.created_at,
                    updatedAt: sharedPost.updated_at
                },
                code: 200
            });
        });
    }

    /**
     * Checks the existence of the shared post via id and userCognitoSub and then updates it.
     * @param id: number
     * @param userCognitoSub: string
     * @param shareCaption: string
     * @returns Promise<{
     *         message: string,
     *         data: {},
     *         code: number
     *     }>
     */
    updateSharedPost(id: number, userCognitoSub: string, shareCaption: string): Promise<{
        message: string,
        data: {},
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            // Check the existence of the shared post by getting it via its id and user_id.
            const sharedPost = await this._postShareRepository.getByIdAndUserCognitoSub(id, userCognitoSub).catch((error: QueryFailedError) => {
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
                    message: Error.DATABASE_ERROR.GET,
                    code: 500
                });
            });

            if (!sharedPost || (sharedPost && (!sharedPost.id || sharedPost.id == 0)) || userCognitoSub !== sharedPost.userId) {
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
                data: {},
                code: 200
            });
        });
    }
}

export default PostShareFacade;