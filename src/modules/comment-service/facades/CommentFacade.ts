import ICommentRepository from "../infras/repositories/ICommentRepository";
import Logger from '../../../config/Logger';
import Error from '../../../config/Error';

import IPostRepository from "../../content-service/infras/repositories/IPostRepository"; // External

import { QueryFailedError } from "typeorm";

class CommentFacade {
    private _log;

    constructor(private _commentRepository: ICommentRepository, private _postRepository: IPostRepository) {
        this._log = Logger.createLogger('CommentFacade.ts');
    }

    /**
     * Validate the post id and add a comment.
     * @param commentAttr: {userCognitoSub: string, postId: number, content: string}
     * @returns Promise<{
     *         message: string,
     *         data: {},
     *         status: number
     *     }>
     */
    addComment(commentAttr: {userCognitoSub: string, postId: number, content: string}): Promise<{
        message: string,
        data: {},
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
           const post = await this._postRepository.getPostById(commentAttr.postId).catch((error) => {
               this._log.error({
                   message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                   payload: {
                       commentAttr
                   }
               });

               return reject(Error.DATABASE_ERROR.GET);
           });

           if (!post) {
               return reject({
                   message: 'Post not found.',
                   code: 404
               });
           }

           await this._commentRepository.create(commentAttr).save().catch((error: QueryFailedError) => {
               this._log.error({
                   message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                   payload: {
                       commentAttr
                   }
               });

               return reject(Error.DATABASE_ERROR.CREATE);
           });

           return resolve({
               message: 'Comment added successfully.',
               data: {},
               code: 201
           });
        });
    }

    /**
     * Update the content of the post comment.
     * @param id: number
     * @param userId: string
     * @param content: string
     * @returns Promise<{
     *         message: string,
     *         data: {},
     *         code: number
     *     }>
     */
    updateComment(id: number, userId: string, content: string): Promise<{
        message: string,
        data: {},
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            const comment = await this._commentRepository.getCommentById(id, userId).catch((error: QueryFailedError) => {
                this._log.error({
                    message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                    payload: {
                        id,
                        userId,
                        content
                    }
                });

                return reject({
                    message: Error.DATABASE_ERROR.GET,
                    code: 500
                });
            });

            if (!comment || (comment && !comment.id)) {
                return reject({
                    message: 'Comment not found.',
                    code: 404
                });
            }

            await this._commentRepository.update(id, userId, content);

            return resolve({
                message: 'The comment was updated successfully.',
                data: {},
                code: 204
            });
        });
    }

    /**
     * Remove a post comment by ID.
     * @param id: number
     * @param userId: string
     * @returns Promise<{
     *         message: string,
     *         data: {},
     *         code: number
     *     }>
     */
    removeComment(id: number, userId: string): Promise<{
        message: string,
        data: {},
        code: number
    }> {

        return new Promise(async (resolve, reject) => {
            const comment = await this._commentRepository.getCommentById(id, userId).catch((error: QueryFailedError) => {
                this._log.error({
                    message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                    payload: {
                        id,
                        userId
                    }
                });

                return reject({
                    message: Error.DATABASE_ERROR.UPDATE,
                    code: 500
                });
            });

            if (!comment || (comment && !comment.id)) {
                return reject({
                    message: 'Comment not found.',
                    code: 404
                });
            }

            await this._commentRepository.removeCommentById(id);

            return resolve({
                message: 'The comment was removed successfully.',
                data: {},
                code: 204
            });
        });
    }
}

export default CommentFacade;