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

class CommentRepository implements ICommentRepository {
    private readonly _model;

    constructor() {
        this._model = new Comments();
    }

    create(item: {userCognitoSub: string, postId: number, content: string}): Comments {

        this._model.id = undefined;
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
}

export default CommentRepository;