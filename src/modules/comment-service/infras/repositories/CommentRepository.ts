import { Comments } from "../../../../database/postgresql/models/Comments";
import ICommentRepository from "./ICommentRepository";
import { getRepository, QueryFailedError, UpdateResult } from 'typeorm';

type getCommentByIdResult = {
    id: number,
    userId: string,
    postId: number,
    content: string,
    status: string,
    createdAt: number,
    updatedAt: number,
    deletedAt: number
};

type getCommentsByPostIdReturnType = Promise<{
    id: number,
    userId: string,
    postId: number,
    content: string,
    status: string,
    createdAt: number,
    updatedAt: number,
    user: {}
}[]>;

class CommentRepository implements ICommentRepository {
    private readonly _model;

    constructor() {
        this._model = new Comments();
    }

    create(item: {userCognitoSub: string, postId: number, content: string}): Comments {

        this._model.id = undefined; // prevent overwriting existing comments from the same user
        this._model.user_id = item.userCognitoSub;
        this._model.post_id = item.postId;
        this._model.content = item.content;
        this._model.status = 'active';
        this._model.created_at = Number(Date.now());

        return this._model;
    }

    /**
     * Get a comment by id.
     * @param id: number
     * @param userId: string
     * @returns Promise<getCommentByIdResult>
     */
    getCommentById(id: number, userId: string): Promise<getCommentByIdResult> {

        return new Promise(async (resolve, reject) => {
            const query = await getRepository(Comments)
                .createQueryBuilder('comments')
                .select('comments')
                .where('id = :id', {id})
                .andWhere('user_id = :userId', {userId})
                .andWhere('deleted_at IS NULL')
                .andWhere('status != :status', {status: 'deleted'})
                .getOne()
                .catch((error: QueryFailedError) => {
                   return reject(error);
                });

            return resolve({
                id: query?.id || 0,
                userId: query?.user_id || '',
                postId: query?.post_id || 0,
                content: query?.content || '',
                status: query?.status || '',
                createdAt: query?.created_at || 0,
                updatedAt: query?.updated_at || 0,
                deletedAt: query?.deleted_at || 0
            });
        });
    }

    /**
     * Get all the comments under a post.
     * @param postId: number
     * @returns getCommentsByPostIdReturnType
     */
    getCommentsByPostId(postId: number): getCommentsByPostIdReturnType {
        return new Promise(async (resolve, reject) => {
            const comments = await getRepository(Comments)
                .createQueryBuilder('comments')
                .select('comments')
                .where('post_id = :postId', { postId })
                .getRawMany()
                .catch((error: QueryFailedError) => {
                    return reject(error);
                });

            // We expect the comments to be an array, other types are not allowed.
            if (Array.isArray(comments)) {

                const newComments = comments.map((comment: {
                    comments_id: number,
                    comments_user_id: string,
                    comments_post_id: number,
                    comments_content: string,
                    comments_status: string,
                    comments_created_at: number,
                    comments_updated_at: number,
                }) => {
                    return {
                        id: comment.comments_id,
                        userId: comment.comments_user_id,
                        postId: comment.comments_post_id,
                        content: comment.comments_content,
                        status: comment.comments_status,
                        createdAt: comment.comments_created_at,
                        updatedAt: comment.comments_updated_at,
                        user: {}
                    }
                });

                return resolve(newComments);
            }

            return reject('invalid type for comments');
        });
    }

    /**
     * Updates a post comment from comments table.
     * @param id: number
     * @param userId: string
     * @param content: string
     * @returns Promise<UpdateResult>
     */
    update(id: number, userId: string, content: string): Promise<UpdateResult> {

        return getRepository(Comments)
            .createQueryBuilder('comments')
            .update(Comments)
            .set({
                content,
                updated_at: Number(Date.now())
            })
            .where('id = :id', {id})
            .andWhere('user_id = :userId', {userId})
            .andWhere('deleted_at IS NULL')
            .andWhere('status != :status', {status: 'deleted'})
            .execute();
    }

    /**
     * Removes a post comment by id.
     * @param id: number
     * @returns Promise<UpdateResult>
     */
    removeCommentById(id: number): Promise<UpdateResult> {

        return getRepository(Comments)
            .createQueryBuilder('comments')
            .update(Comments)
            .set({
                status: 'deleted',
                deleted_at: Number(Date.now())
            })
            .where('id = :id', {id})
            .execute();
    }
}

export default CommentRepository;