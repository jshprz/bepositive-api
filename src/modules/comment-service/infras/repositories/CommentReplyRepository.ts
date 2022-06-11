import ICommentReplyRepository from "./ICommentReplyRepository";
import { CommentReplies } from "../../../../database/postgresql/models/CommentReplies";
import {getCommentRepliesByCommentIdReturnType} from "../../../types";
import {getRepository, QueryFailedError} from "typeorm";

class CommentReplyRepository implements ICommentReplyRepository {
    private readonly _model;

    constructor() {
        this._model = new CommentReplies();
    }

    /**
     * Get comment reply by comment ID.
     * @param commentId: string
     * @returns Promise<getCommentRepliesByCommentIdReturnType>
     */
    get(commentId: string): Promise<getCommentRepliesByCommentIdReturnType> {

        return new Promise(async (resolve, reject) => {
            const reply = await getRepository(CommentReplies)
                .createQueryBuilder('comment_replies')
                .select('comment_replies')
                .where('comment_id = :commentId', { commentId })
                .getOne()
                .catch((error: QueryFailedError) => {
                    return reject(error);
                });

            return resolve({
                id: reply?.id || '',
                commentId: reply?.comment_id || '',
                content: reply?.content || '',
                createdAt: reply?.created_at || 0,
                updatedAt: reply?.updated_at || 0,
                actor: {},
                replies: []
            });
        });
    }
}

export default CommentReplyRepository;