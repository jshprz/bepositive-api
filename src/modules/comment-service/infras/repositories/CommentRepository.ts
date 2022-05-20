import { Comments } from "../../../../database/postgresql/models/Comments";
import { CommentReplies } from "../../../../database/postgresql/models/CommentReplies";
import ICommentRepository from "./ICommentRepository";
import {getManager, getRepository, QueryFailedError, UpdateResult} from 'typeorm';
import type { getCommentByIdResult, getCommentRepliesByCommentIdReturnType, getCommentsByPostIdReturnType } from '../../../types';

class CommentRepository implements ICommentRepository {
    private readonly _model;
    private readonly _comment_replies_model;

    constructor() {
        this._model = new Comments();
        this._comment_replies_model = new CommentReplies();
    }

    create(item: {userCognitoSub: string, postId: string, content: string}): Comments {

        this._model.id = undefined; // prevent overwriting existing comments from the same user
        this._model.user_id = item.userCognitoSub;
        this._model.post_id = item.postId;
        this._model.content = item.content;
        this._model.status = 'active';

        return this._model;
    }

    /**
     * Get a comment by id.
     * @param id: string
     * @param userId: string
     * @returns Promise<getCommentByIdResult>
     */
    getCommentById(id: string, userId: string, type: string): Promise<getCommentByIdResult> {
        return new Promise(async (resolve, reject) => {
            let query:any;

            if (type == 'comment') {
                query = await getRepository(Comments)
                .createQueryBuilder('comments')
                .select('comments')
                .where('id = :id', {id})
                .getOne()
                .catch((error: QueryFailedError) => {
                return reject(error);
                });
            } else {
                query = await getRepository(CommentReplies)
                .createQueryBuilder('comment_replies')
                .select('comment_replies')
                .where('id = :id', {id})
                .getOne()
                .catch((error: QueryFailedError) => {
                   return reject(error);
                });
            }

            return resolve({
                id: query?.id || '',
                userId: query?.user_id || '',
                commentId: query?.comment_id || '',
                postId: query?.post_id || '',
                content: query?.content || '',
                status: query?.status || '',
                createdAt: query?.created_at || new Date(),
                updatedAt: query?.updated_at || new Date(),
                deletedAt: query?.deleted_at || new Date()
            });
        });
    }

    /**
     * Get the ids of a comment or comment reply.
     * @param id: string
     * @returns Promise<{id: string}[]>
     */
    getCommentOrCommentReplyIdsById(id: string): Promise<{id: string}[]> {
        return new Promise(async (resolve, reject) => {

            const comment: { id: string }[] = await getManager()
                .query(`
                    SELECT (id) FROM comments
                    WHERE id = '${id}'
                    UNION
                    SELECT (id) FROM comment_replies
                    WHERE id = '${id}'
                `)
                .catch((error: QueryFailedError) => {
                    return reject(error);
                });

            return resolve(comment);
        });
    }

    /**
     * Get all the comments under a post.
     * @param postId: string
     * @returns Promise<getCommentsByPostIdReturnType[]>
     */
    getCommentsByPostId(postId: string): Promise<getCommentsByPostIdReturnType[]> {
        return new Promise(async (resolve, reject) => {
            const comments = await getRepository(Comments)
                .createQueryBuilder('comments')
                .select('comments')
                .where('post_id = :postId', { postId })
                .orderBy('created_at', 'DESC')
                .getRawMany()
                .catch((error: QueryFailedError) => {
                    return reject(error);
                });

            // We expect the comments to be an array, other types are not allowed.
            if (Array.isArray(comments)) {

                const newComments = comments.map((comment: {
                    comments_id: string,
                    comments_user_id: string,
                    comments_post_id: string,
                    comments_content: string,
                    comments_status: string,
                    comments_created_at: Date,
                    comments_updated_at: Date,
                }) => {
                    return {
                        id: comment.comments_id,
                        userId: comment.comments_user_id,
                        postId: comment.comments_post_id,
                        content: comment.comments_content,
                        status: comment.comments_status,
                        createdAt: comment.comments_created_at,
                        updatedAt: comment.comments_updated_at,
                        actor: {
                            userId:comment.comments_user_id,
                            name: "",
                            avatar: {
                              url: "",
                              type: "",
                              height: "",
                              width: ""
                            }
                          },
                        replies: []
                    }
                });

                return resolve(newComments);
            }

            return reject('invalid type for comments');
        });
    }

    /**
     * Updates a post comment from comments table.
     * @param id: string
     * @param userId: string
     * @param content: string
     * @param type: string
     * @returns Promise<UpdateResult>
     */
    update(id: string, userId: string, content: string, type: string): Promise<UpdateResult> {
        if (type == 'comment') {
            return getRepository(Comments)
            .createQueryBuilder('comments')
            .update(Comments)
            .set({content})
            .where('id = :id', {id})
            .andWhere('user_id = :userId', {userId})
            .andWhere('deleted_at IS NULL')
            .execute();
        } else {
            return getRepository(CommentReplies)
            .createQueryBuilder('comment_replies')
            .update(CommentReplies)
            .set({content})
            .where('id = :id', {id})
            .andWhere('user_id = :userId', {userId})
            .andWhere('deleted_at IS NULL')
            .execute();
        }
    }

    /**
     * Performs soft delete for Comments and Comment Replies
     * @param id: string
     * @param type: string
     * @returns Promise<boolean>
     */
     softDelete(id: string, type: string): Promise<boolean> {
        if (type == 'comment') {
            return new Promise(async (resolve, reject) => {
                await getRepository(Comments)
                    .createQueryBuilder()
                    .where("id = :id", {id})
                    .softDelete()
                    .execute()
                    .catch((error: QueryFailedError) => {
                        return reject(error);
                    });
                return resolve(true);
            })
        } else {
            return new Promise(async (resolve, reject) => {
                await getRepository(CommentReplies)
                    .createQueryBuilder()
                    .where("id = :id", {id})
                    .softDelete()
                    .execute()
                    .catch((error: QueryFailedError) => {
                        return reject(error);
                    });
                return resolve(true);
            })
        }
    }

    /**
     * Reply to comments and comment replies
     * @param item: {commentId: string, userCognitoSub: string, content: string}
     * @returns CommentReplies
     */
    replyToComment(item: {commentId: string, userCognitoSub: string, content: string}): CommentReplies {

        this._comment_replies_model.id = undefined; // prevent overwriting existing comments from the same user
        this._comment_replies_model.comment_id = item.commentId;
        this._comment_replies_model.user_id = item.userCognitoSub;
        this._comment_replies_model.content = item.content;

        return this._comment_replies_model;
    }

    /**
     * Get a comment reply by comment id.
     * @param commentId: string
     * @returns Promise<getCommentRepliesByCommentIdReturnType>
     */
    getCommentRepliesByCommentId(commentId: string): Promise<getCommentRepliesByCommentIdReturnType[]>{

        return new Promise(async (resolve, reject) => {
            const replies = await getRepository(CommentReplies)
                .createQueryBuilder('comment_replies')
                .select('comment_replies')
                .where('comment_id = :commentId', {commentId})
                .orderBy('created_at', 'ASC')
                .getRawMany()
                .catch((error: QueryFailedError) => {
                    return reject(error);
                });

            // We expect the replies to be an array, other types are not allowed.
            if (Array.isArray(replies)) {

                const newReplies = replies.map((reply: {
                    comment_replies_id: string,
                    comment_replies_comment_id: string,
                    comment_replies_user_id: string,
                    comment_replies_content: string,
                    comment_replies_created_at: Date,
                    comment_replies_updated_at: Date,
                }) => {
                    return {
                        id: reply.comment_replies_id,
                        userId: reply.comment_replies_user_id,
                        commentId: reply.comment_replies_comment_id,
                        content: reply.comment_replies_content,
                        createdAt: reply.comment_replies_created_at,
                        updatedAt: reply.comment_replies_updated_at,
                        actor: {
                            userId: reply.comment_replies_user_id,
                            name: "",
                            avatar: {
                              url: "",
                              type: "",
                              height: "",
                              width: ""
                            }
                          },
                        replies: []
                    }
                });

                return resolve(newReplies);
            }

            return reject('invalid type for comment replies');
        });
    }
}

export default CommentRepository;