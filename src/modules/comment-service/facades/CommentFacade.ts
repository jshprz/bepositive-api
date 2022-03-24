import ICommentRepository from "../infras/repositories/ICommentRepository";
import Logger from '../../../config/Logger';
import Error from '../../../config/Error';

import IPostRepository from "../../content-service/infras/repositories/IPostRepository"; // External

import { QueryFailedError } from "typeorm";
import type { commentType } from '../../types';

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

               return reject({
                   message: Error.DATABASE_ERROR.GET,
                   code: 500
               });
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

               return reject({
                   message: Error.DATABASE_ERROR.CREATE,
                   code: 500
               });
           });

           return resolve({
               message: 'Comment added successfully.',
               data: {},
               code: 201
           });
        });
    }

    /**
     * Get all the comments under a post .
     * @param postId: number
     * @returns Promise<{
     *         message: string,
     *         data: commentType[],
     *         code: number
     *     }>
     */
    getCommentsByPostId(postId: number): Promise<{
        message: string,
        data: commentType[],
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            const comments = await this._commentRepository.getCommentsByPostId(postId).catch((error: QueryFailedError) => {
                this._log.error({
                    function: 'getCommentsByPostId()',
                    message: error.toString(),
                    payload: { postId }
                });

                return reject({
                    message: error,
                    code: 500
                });
            });

            if (Array.isArray(comments)) {

                return resolve({
                    message: 'Comments successfully retrieved',
                    data: comments || [],
                    code: 200
                });
            } else {
                return reject({
                    message: 'Invalid type for comments.',
                    code: 500
                });
            }
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

            await this._commentRepository.softDelete(id);

            return resolve({
                message: 'The comment was removed successfully.',
                data: {},
                code: 204
            });
        });
    }
}

export default CommentFacade;