import ICommentRepository from "../infras/repositories/ICommentRepository";
import ICommentLikeRepository from "../infras/repositories/ICommentLikeRepository";
import Logger from '../../../config/Logger';
import Error from '../../../config/Error';

import IPostRepository from "../../content-service/infras/repositories/IPostRepository"; // External

import { QueryFailedError } from "typeorm";
import type {
    getCommentByIdResult,
    getCommentsByPostIdReturnType,
    getCommentRepliesByCommentIdReturnType,
    postType,
    commentType,
} from '../../types';

import CommentRepository from "../infras/repositories/CommentRepository";
import UserProfileRepository from "../../../infras/repositories/UserProfileRepository";

class CommentFacade {
    private _log;

    constructor(private _commentRepository: ICommentRepository, private _postRepository: IPostRepository, private _commentLikeRepository: ICommentLikeRepository, private _userProfileRepository: UserProfileRepository) {

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
                   function: 'getPostById()',
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
     * Get all the comments and replies under a post .
     * @param postId: string
     * @param loggedInUserId: string
     * @returns Promise<{
     *         message: string,
     *         data: commentType[],
     *         code: number
     *     }>
     */
    getCommentsByPostId(postId: string, loggedInUserId: string): Promise<{
        message: string,
        data: commentType[],
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            const post: void | postType = await this._postRepository.getPostById(postId).catch((error: QueryFailedError) => {
                this._log.error({
                    function: 'getCommentsByPostId()',
                    message: error.toString(),
                    payload: { postId }
                });

                return reject({
                    message: Error.DATABASE_ERROR.GET,
                    code: 500
                });
            });

            if (post && !post.content.postId) {
                return reject({
                    message: 'Post not found.',
                    code: 404
                });
            }
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
                const promises: any = [];

                for (const comment of comments) {
                    // Get the user of a comment.
                    if (comment.actor) {
                        const userProfileData = await this._userProfileRepository.getUserProfileByUserId(comment.actor.userId).catch((error) => {
                            throw error;
                        });

                        comment.actor.name = userProfileData.name || '';
                        comment.actor.avatar.url = userProfileData.avatar || '';
                    }

                    const commentLike = await this._commentLikeRepository.getByIdAndUserId(comment.id, loggedInUserId).catch((error) => {
                        throw error;
                    });

                    // To set the comment like status - if the logged-in user liked the comment/reply or not.
                    if (commentLike && commentLike.id) {
                        comment.isLiked = true;
                    }

                    promises.push(this._getConsolidatedCommentReplies(comment.id, loggedInUserId));
                }

                Promise.allSettled(promises).then((results) => {
                    const resultsMap = results.map((result) => {
                        if (result.status !== 'rejected') {
                            return result.value;
                        }

                        return '';
                    });

                    const processedCommentsData: getCommentsByPostIdReturnType[] = comments.map((comment, indexX) => {
                        resultsMap.forEach((replies, indexY) => {
                            if (indexX === indexY) {
                                comment.replies = (replies !== '')? replies : [];
                            }
                        });

                        return comment;
                    });

                    return resolve({
                        message: 'Comments retrieved successfully.',
                        data: processedCommentsData,
                        code: 200
                    });
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
     * Get the replies of a comment.
     * @param commentId: string
     * @param loggedInUserId: string
     * @returns Promise<getCommentRepliesByCommentIdReturnType[]>
     */
    private async _getConsolidatedCommentReplies(commentId: string, loggedInUserId: string): Promise<getCommentRepliesByCommentIdReturnType[]> {
        return new Promise(async (resolve, reject) => {
            const replies: getCommentRepliesByCommentIdReturnType[] | void = await this._commentRepository.getCommentRepliesByCommentId(commentId)
                .catch((error: QueryFailedError) => {
                    return reject(error);
                });
            if (Array.isArray(replies)) {
                for (const reply of replies) {
                    // Get the user of a reply.
                    if (reply.actor) {
                        const userProfileData = await this._userProfileRepository.getUserProfileByUserId(reply.actor.userId).catch((error) => {
                            throw error;
                        });

                        reply.actor.name = userProfileData.name || '';
                        reply.actor.avatar.url = userProfileData.avatar || '';
                    }

                    const commentLike = await this._commentLikeRepository.getByIdAndUserId(reply.id, loggedInUserId).catch((error) => {
                        throw error;
                    });

                    // To set the comment like status - if the logged-in user liked the comment/reply or not.
                    if (commentLike && commentLike.id) {
                        reply.isLiked = true;
                    }

                    const repliesOfReplyResult = await this._getRepliesOfReply(reply.id, loggedInUserId);
                    reply.replies = repliesOfReplyResult;
                }
                return resolve(replies);
            }
        });
    }

    /**
     * Recursively get the replies of a reply.
     * @param commentId: string
     * @param loggedInUserId: string
     * @returns Promise<getCommentRepliesByCommentIdReturnType[]>
     */
    private async _getRepliesOfReply(commentId: string, loggedInUserId: string): Promise<getCommentRepliesByCommentIdReturnType[]> {
        const repliesOfReplyHolder: getCommentRepliesByCommentIdReturnType[] = [];
        const repliesArr: getCommentRepliesByCommentIdReturnType[] = await this._commentRepository.getCommentRepliesByCommentId(commentId);
        let repliesArrHolder: getCommentRepliesByCommentIdReturnType[] = [...repliesArr];
        const tempRepliesArrHolder: getCommentRepliesByCommentIdReturnType[] = [];
        let replyIdHolder = '';

        await (async function recursiveFunction(commentId: string) {
            const commentRepository: ICommentRepository = new CommentRepository();
            const repliesArr2: getCommentRepliesByCommentIdReturnType[] = await commentRepository.getCommentRepliesByCommentId(commentId);

            if (repliesArrHolder.length < 1) {
                return repliesOfReplyHolder;
            }

            replyIdHolder = repliesArrHolder[repliesArrHolder.length - 1].id;

            const findId = repliesOfReplyHolder.find(r => r.id === repliesArrHolder[repliesArrHolder.length - 1].id);
            if (!findId) {
                repliesOfReplyHolder.push(repliesArrHolder[repliesArrHolder.length - 1]);
            }

            repliesArr2.forEach((reply) => {
                tempRepliesArrHolder.push(reply);
            });

            repliesArrHolder.pop();

            if (repliesArrHolder.length < 1) {
                repliesArrHolder = tempRepliesArrHolder.map(i => i);
                tempRepliesArrHolder.length = 0;
            }

            await recursiveFunction(replyIdHolder);
        })(commentId);

        for (const reply of repliesOfReplyHolder) {
            // Get the user of a child reply.
            if (reply.actor) {
                const userProfileData = await this._userProfileRepository.getUserProfileByUserId(reply.actor.userId).catch((error) => {
                    throw error;
                });

                reply.actor.name = userProfileData.name || '';
                reply.actor.avatar.url = userProfileData.avatar || '';
            }

            const commentLike = await this._commentLikeRepository.getByIdAndUserId(reply.id, loggedInUserId).catch((error) => {
                throw error;
            });

            // To set the comment like status - if the logged-in user liked the comment/reply or not.
            if (commentLike && commentLike.id) {
                reply.isLiked = true;
            }
        }
        // reverse the repliesOfReplyHolder object for the order to be correct in terms of createdAt property
        const reversedrepliesOfReplyHolder = repliesOfReplyHolder.reverse();
        return reversedrepliesOfReplyHolder;
    }

    /**
     * Get all the replies under a comment.
     * @param commentId: string
     * @returns Promise<{
     *         message: string,
     *         data: commentType[],
     *         code: number
     *     }>
     */
     getCommentRepliesByCommentId(commentId: string): Promise<{
        message: string,
        data: getCommentRepliesByCommentIdReturnType[],
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            const replies: getCommentRepliesByCommentIdReturnType[] | void = await this._commentRepository.getCommentRepliesByCommentId(commentId).catch((error: QueryFailedError) => {
                this._log.error({
                    function: 'getCommentRepliesByCommentId()',
                    message: error.toString(),
                    payload: { commentId }
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

            if (Array.isArray(replies)) {

                return resolve({
                    message: 'Comment replies successfully retrieved',
                    data: replies || [],
                    code: 200
                });
            } else {
                return reject({
                    message: 'Invalid type for comment replies.',
                    code: 500
                });
            }
        });
    }

    /**
     * Update the content of the post comment or reply.
     * @param id: string
     * @param userId: string
     * @param content: string
     * @param type: string
     * @returns Promise<{
     *         message: string,
     *         data: {},
     *         code: number
     *     }>
     */
    updateCommentOrReply(id: string, userId: string, content: string, type: string): Promise<{
        message: string,
        data: {},
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            const comment: getCommentByIdResult | void = await this._commentRepository.getCommentById(id, userId, type).catch((error: QueryFailedError) => {
                this._log.error({
                    function: 'getCommentById()',
                    message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                    payload: {
                        id,
                        userId,
                        content
                    }
                });

                if (error.message.includes('invalid input syntax for type uuid')) {
                    return reject({
                        message: type == 'comment' ? 'Comment not found.' : 'Comment reply not found.',
                        code: 404
                    });
                }

                return reject({
                    message: Error.DATABASE_ERROR.GET,
                    code: 500
                });
            });
            if (type == 'comment') {
                if (!comment || (comment && (!comment.id || comment.id == '') || comment.commentId != '' || comment.userId != userId)) {
                    return reject({
                        message: 'Comment not found.',
                        code: 404
                    });
                }
            } else {
                if (!comment || (comment && (!comment.commentId || comment.commentId == '' || comment.userId != userId))) {
                    return reject({
                        message: 'Comment reply not found.',
                        code: 404
                    });
                }
            }

            await this._commentRepository.update(id, userId, content, type);

            return resolve({
                message: type == 'comment' ? 'The comment was updated successfully.' : 'The comment reply was updated successfully.',
                data: {},
                code: 200
            });
        });
    }

    /**
     * Remove a post comment or comment reply by ID.
     * @param id: string
     * @param userId: string
     * @param type: string
     * @returns Promise<{
     *         message: string,
     *         data: {},
     *         code: number
     *     }>
     */
     removeCommentOrReply(id: string, userId: string, type: string): Promise<{
        message: string,
        data: {},
        code: number
    }> {

        return new Promise(async (resolve, reject) => {
            const comment: getCommentByIdResult | void = await this._commentRepository.getCommentById(id, userId, type).catch((error: QueryFailedError) => {
                this._log.error({
                    function: 'getCommentById()',
                    message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                    payload: {
                        id,
                        userId
                    }
                });

                if (error.message.includes('invalid input syntax for type uuid')) {
                    return reject({
                        message: type == 'comment' ? 'Comment not found.' : 'Comment reply not found.',
                        code: 404
                    });
                }

                return reject({
                    message: Error.DATABASE_ERROR.UPDATE,
                    code: 500
                });
            });

            if (type == 'comment') {
                if (!comment || (comment && (!comment.id || comment.id == '') || comment.commentId != '' || comment.userId != userId)) {
                    return reject({
                        message: 'Comment not found.',
                        code: 404
                    });
                }
            } else {
                if (!comment || (comment && (!comment.commentId || comment.commentId == '' || comment.userId != userId))) {
                    return reject({
                        message: 'Comment reply not found.',
                        code: 404
                    });
                }
            }

            await this._commentRepository.softDelete(id, type);

            return resolve({
                message: type == 'comment' ? 'The comment was removed successfully.' : 'The comment reply was removed successfully.',
                data: {},
                code: 200
            });
        });
    }

    /**
     * To like or unlike a comment or comment reply.
     * @param commentId: string
     * @param postId: string
     * @param userCognitoSub: string
     * @param like: boolean
     * @param classification: string
     * @param commentType: string
     * @returns Promise<{
     *         message: string,
     *         data: {isLiked: boolean},
     *         code: number
     *     }>
     */
     likeOrUnlikeCommentOrReply(commentId: string, postId: string, userCognitoSub: string, like: boolean, classification: string, commentType: string): Promise<{
        message: string,
        data: {isLiked: boolean},
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            const comment = await this._commentRepository.getCommentById(commentId, userCognitoSub, commentType).catch((error) => {
                this._log.error({
                    function: 'getCommentById()',
                    message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                    payload: {
                        postId,
                        like,
                        userCognitoSub
                    }
                });

                if (error.message.includes('invalid input syntax for type uuid')) {
                    return reject({
                        message: commentType == 'comment' ? 'Comment not found.' : 'Comment reply not found.',
                        code: 404
                    });
                }

                return reject({
                    message: Error.DATABASE_ERROR.GET,
                    code: 500
                });
            });

            // check if comment / reply exists first.
            if (commentType == 'comment') {
                if (!comment || (comment && comment.id == '' ) || (comment && !comment.id) || (comment && comment.postId !== postId) || comment.commentId != '') {
                    return reject({
                        message: 'Comment not found.',
                        code: 404
                    });
                }
            } else {
                if (!comment || (comment && comment.id == '' ) || (comment && !comment.id) || comment.commentId == '') {
                    return reject({
                        message: 'Comment reply not found.',
                        code: 404
                    });
                }
            }

            // check if post exists
            if (classification == "REGULAR_POST") {
                const post = await this._postRepository.getPostById(postId).catch((error) => {
                    this._log.error({
                        function: 'getPostById()',
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
                        function: 'getSharedPostById()',
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
                    function: 'getByIdAndUserId()',
                    message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                    payload: {
                        postId,
                        userCognitoSub
                    }
                });

                if (error.message.includes('invalid input syntax for type uuid')) {
                    return reject({
                        message: commentType == 'comment' ? 'Comment not found.' : 'Comment reply not found.',
                        code: 404
                    });
                }

                return reject({
                    message: Error.DATABASE_ERROR.GET,
                    code: 500
                });
            });

            if (like && commentLiked) {
                return reject({
                    message: commentType == 'comment' ? "Comment already liked." : "Comment reply already liked.",
                    code: 400
                });
            } else if (!like && !commentLiked) {
                return reject({
                    message: commentType == 'comment' ? "Comment already unliked." : "Comment reply already unliked.",
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
                        message: commentType == 'comment' ? "Comment successfully liked." : "Comment reply successfully liked.",
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
                        message: commentType == 'comment' ? "Comment successfully unliked." : "Comment reply successfully unliked.",
                        data: {isLiked: false},
                        code: 200
                    });
                }
           }
        });
    }
    /**
     * To like a comment or reply.
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
     * To unlike a comment or reply.
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

    /**
     * Replies to a comment or another reply.
     * @param item: {commentId: string, userCognitoSub: string, content: string}
     * @returns Promise<{
     *         message: string,
     *         data: {},
     *         status: number
     *     }>
     */
    replyToComment(item: { commentId: string, userCognitoSub: string, content: string }): Promise<{
        message: string,
        data: {},
        code: number
    }> {
        return new Promise(async (resolve, reject) => {

            // validate existence of comment
            const comment = await this._commentRepository.getCommentOrCommentReplyIdsById(item.commentId).catch((error) => {
                this._log.error({
                    function: 'getCommentOrCommentReplyIdsById()',
                    message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                    payload: {
                        item
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

            if (!comment || comment.length < 1) {
                return reject({
                    message: 'Comment not found.',
                    code: 404
                });
            }

            await this._commentRepository.replyToComment(item).save().catch((error: QueryFailedError) => {
                this._log.error({
                    function: 'replyToComment()',
                    message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                    payload: {
                        item
                    }
                });

                return reject({
                    message: Error.DATABASE_ERROR.CREATE,
                    code: 500
                });
            });

            return resolve({
                message: 'Successfully replied to comment.',
                data: {},
                code: 200
            });
        });
    }

}

export default CommentFacade;