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
            const post = await this._postRepository.getPostById(postId).catch((error) => {
                this._log.error({
                    message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                    payload: {
                        postId
                    }
                });

                return reject(Error.DATABASE_ERROR.GET);
            });

            if (!post.id) {
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
                code: 201
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
            post_id: number,
            user_id: string,
            share_caption: string,
            created_at: number
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
                    post_id: sharedPost.post_id,
                    user_id: sharedPost.user_id,
                    share_caption: sharedPost.share_caption,
                    created_at: sharedPost.created_at
                },
                code: 200
            });
        });
    }
}

export default PostShareFacade;