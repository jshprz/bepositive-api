import ICommentRepository from "../infras/repositories/ICommentRepository";
import ICommentLikeRepository from "../infras/repositories/ICommentLikeRepository";
import Logger from '../../../config/Logger';
import Error from '../../../config/Error';

import IPostRepository from "../../content-service/infras/repositories/IPostRepository"; // External

import { QueryFailedError } from "typeorm";
import type {
    commentType,
    getCommentByIdResult,
    getCommentsByPostIdReturnType,
    postType
} from '../../types';

class CommentFacade {
    private _log;

    constructor(private _commentRepository: ICommentRepository, private _postRepository: IPostRepository, private _commentLikeRepository: ICommentLikeRepository) {

        this._log = Logger.createLogger('CommentFacade.ts');
    }

    /**
     * Validate the post id and add a comment.
     * @param commentAttr: {userCognitoSub: string, postId: string, content: string}
     * @returns Promise<{
     *         message: string,
     *         data: {},
     *         status: number
     *     }>
     */
    addComment(commentAttr: {userCognitoSub: string, postId: string, content: string}): Promise<{
        message: string,
        data: {},
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
           const post: postType | void = await this._postRepository.getPostById(commentAttr.postId).catch((error) => {
               this._log.error({
                   function: 'addComment()',
                   message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                   payload: {
                       commentAttr
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

           if (!post || (post && (!post.content.postId || post.content.postId == ''))) {
               return reject({
                   message: 'Post not found.',
                   code: 404
               });
           }

           await this._commentRepository.create(commentAttr).save().catch((error: QueryFailedError) => {
               this._log.error({
                   function: 'addComment()',
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
               code: 200
           });
        });
    }

    /**
     * Get all the comments under a post .
     * @param postId: string
     * @returns Promise<{
     *         message: string,
     *         data: commentType[],
     *         code: number
     *     }>
     */
    getCommentsByPostId(postId: string): Promise<{
        message: string,
        data: commentType[],
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            const comments: getCommentsByPostIdReturnType[] | void = await this._commentRepository.getCommentsByPostId(postId).catch((error: QueryFailedError) => {
                this._log.error({
                    function: 'getCommentsByPostId()',
                    message: error.toString(),
                    payload: { postId }
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
     * @param id: string
     * @param userId: string
     * @param content: string
     * @returns Promise<{
     *         message: string,
     *         data: {},
     *         code: number
     *     }>
     */
    updateComment(id: string, userId: string, content: string): Promise<{
        message: string,
        data: {},
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            const comment: getCommentByIdResult | void = await this._commentRepository.getCommentById(id, userId).catch((error: QueryFailedError) => {
                this._log.error({
                    function: 'updateComment()',
                    message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                    payload: {
                        id,
                        userId,
                        content
                    }
                });

                if (error.message.includes('invalid input syntax for type uuid')) {
                    return reject({
                        message: 'Comment not found.',
                        code: 404
                    });
                }

                return reject({
                    message: Error.DATABASE_ERROR.GET,
                    code: 500
                });
            });

            if (!comment || (comment && (!comment.id || comment.id == ''))) {
                return reject({
                    message: 'Comment not found.',
                    code: 404
                });
            }

            await this._commentRepository.update(id, userId, content);

            return resolve({
                message: 'The comment was updated successfully.',
                data: {},
                code: 200
            });
        });
    }

    /**
     * Remove a post comment by ID.
     * @param id: string
     * @param userId: string
     * @returns Promise<{
     *         message: string,
     *         data: {},
     *         code: number
     *     }>
     */
    removeComment(id: string, userId: string): Promise<{
        message: string,
        data: {},
        code: number
    }> {

        return new Promise(async (resolve, reject) => {
            const comment: getCommentByIdResult | void = await this._commentRepository.getCommentById(id, userId).catch((error: QueryFailedError) => {
                this._log.error({
                    function: 'removeComment()',
                    message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                    payload: {
                        id,
                        userId
                    }
                });

                if (error.message.includes('invalid input syntax for type uuid')) {
                    return reject({
                        message: 'Comment not found.',
                        code: 404
                    });
                }

                return reject({
                    message: Error.DATABASE_ERROR.UPDATE,
                    code: 500
                });
            });

            if (!comment || (comment && (!comment.id || comment.id == ''))) {
                return reject({
                    message: 'Comment not found.',
                    code: 404
                });
            }

            await this._commentRepository.softDelete(id);

            return resolve({
                message: 'The comment was removed successfully.',
                data: {},
                code: 200
            });
        });
    }

    /**
     * To like or unlike a comment.
     * @param commentId: string
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
     likeOrUnlikeComment(commentId: string, postId: string, userCognitoSub: string, like: boolean, classification: string): Promise<{
        message: string,
        data: {isLiked: boolean},
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            const comment = await this._commentRepository.getCommentById(commentId, userCognitoSub).catch((error) => {
                this._log.error({
                    function: 'likeOrUnlikeComment()',
                    message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                    payload: {
                        postId,
                        like,
                        userCognitoSub
                    }
                });

                if (error.message.includes('invalid input syntax for type uuid')) {
                    return reject({
                        message: 'Comment not found.',
                        code: 404
                    });
                }

                return reject({
                    message: Error.DATABASE_ERROR.GET,
                    code: 500
                });
            });

            // check if comment exists first.
            if (!comment || (comment && comment.id == '' ) || (comment && !comment.id) || (comment && comment.postId !== postId)) {
                return reject({
                    message: 'Comment not found.',
                    code: 404
                });
            }

            // check if post exists
            if (classification == "REGULAR_POST") {
                const post = await this._postRepository.getPostById(postId).catch((error) => {
                    this._log.error({
                        function: 'likeOrUnlikeComment()',
                        message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                        payload: {
                            postId,
                            like,
                            userCognitoSub
                        }
                    });

                    return reject({
                        message: Error.DATABASE_ERROR.GET,
                        code: 500
                    });
                });

                if (!post || (post && post.content.postId == '' ) || (post && !post.content.postId)) {
                    return reject({
                        message: 'Post does not exist.',
                        code: 404
                    });
                }
            } else {
                // we're dealing with a shared post
                const post = await this._postRepository.getSharedPostById(postId).catch((error) => {
                    this._log.error({
                        function: 'likeOrUnlikeComment()',
                        message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                        payload: {
                            postId,
                            like,
                            userCognitoSub
                        }
                    });

                    return reject({
                        message: Error.DATABASE_ERROR.GET,
                        code: 500
                    });
                });

                // check if post exists first.
                if (!post || (post && post.id == '' ) || (post && !post.id)) {
                    return reject({
                        message: 'Post does not exist.',
                        code: 404
                    });
                }
            }

            // check if user has already liked or unliked the post
            const commentLiked = await this._commentLikeRepository.getByIdAndUserId(commentId, userCognitoSub).catch((error) => {
                this._log.error({
                    function: 'likeOrUnlikeComment()',
                    message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                    payload: {
                        postId,
                        userCognitoSub
                    }
                });
            });

            if (like && commentLiked) {
                return reject({
                    message: "Comment already liked.",
                    code: 400
                });
            } else if (!like && !commentLiked) {
                return reject({
                    message: "Comment already unliked.",
                    code: 400
                });
            }

            // create or delete a record in the database depending on the value of the like parameter.
            if (like) {
                const likeResult = await this._likeComment(commentId, postId, userCognitoSub, classification).catch((error) => {
                    return reject(error);
                });
                if (likeResult) {
                    return resolve({
                        message: 'Comment successfully liked.',
                        data: {isLiked: true},
                        code: 200
                    });
                }
           } else {
                const unlikeResult = await this._unlikeComment(commentId, userCognitoSub).catch((error) => {
                    return reject(error);
                });
                if (unlikeResult) {
                    return resolve({
                        message: 'Comment successfully unliked.',
                        data: {isLiked: false},
                        code: 200
                    });
                }
           }
        });
    }
    /**
     * To like a comment.
     * @param commentId: string
     * @param postId: string
     * @param userCognitoSub: string
     * @param classification: string
     * @returns Promise<{
     *         message: string,
     *         data: boolean,
     *         code: number
     *     }>
     */
    private _likeComment(commentId: string, postId: string, userCognitoSub: string, classification: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
           await this._commentLikeRepository.create(commentId, postId, userCognitoSub, classification).save().catch((error: QueryFailedError) => {
               this._log.error({
                   message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                   payload: {
                       commentId,
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
     * To unlike a comment.
     * @param commentId: string
     * @param userCognitoSub: string
     * @returns Promise<{
     *         message: string,
     *         data: boolean,
     *         code: number
     *     }>
     */
    private _unlikeComment(commentId: string, userCognitoSub: string): Promise<boolean> {
        return new Promise(async (resolve,reject) => {
            await this._commentLikeRepository.deleteByIdAndUserId(commentId, userCognitoSub).catch((error) => {
                this._log.error({
                    message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                    payload: {
                        commentId,
                        userCognitoSub
                    }
                });
                return reject(Error.DATABASE_ERROR.DELETE);
            });
            resolve(true);
        });
    }

}

export default CommentFacade;