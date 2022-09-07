import { getRepository, DeleteResult } from "typeorm";
import { CommentLikes } from "../../database/postgresql/models/CommentLikes";
import { CommentReplies } from "../../database/postgresql/models/CommentReplies";
import ICommentLikeRepository from "./interfaces/ICommentLikeRepository";

class CommentLikeRepository implements ICommentLikeRepository {
    private readonly _model;
    private readonly _comment_replies_model;

    constructor() {
        this._model = new CommentLikes();
        this._comment_replies_model = new CommentReplies();
    }

    /**
     * Creates comment_like record in the database.
     * @param userCognitoSub: string,
     * @param commentId: string
     * @param postId: string
     * @param classification: string
     * @returns instance of CommentLikes
     */
    create(commentId: string, postId: string, userCognitoSub: string, classification: string): CommentLikes {
        this._model.id = undefined; // prevent overwriting existing comments from the same user
        this._model.user_id = userCognitoSub;
        this._model.comment_id = commentId;
        this._model.post_id = postId;
        this._model.classification = classification;

        return this._model;
    }

    /**
     * Get a CommentLike by id and user id
     * @param commentId: string
     * @param userCognitoSub: string
     * @returns Promise<any>
     */
    getByIdAndUserId(commentId: string, userCognitoSub: string): Promise<any> {

        return getRepository(CommentLikes)
            .createQueryBuilder('comment_likes')
            .select('comment_likes')
            .where('comment_id = :commentId', {commentId})
            .andWhere('user_id = :userCognitoSub', {userCognitoSub})
            .getOne();
    }

    /**
     * Deletes comment_like record in the database.
     * @param commentId: string
     * @param userCognitoSub: string
     * @returns Promise<DeleteResult>
     */
    deleteByIdAndUserId(commentId: string, userCognitoSub: string): Promise<DeleteResult> {

        return getRepository(CommentLikes)
            .createQueryBuilder()
            .delete()
            .from(CommentLikes)
            .where("comment_id = :comment_id", { comment_id: commentId })
            .andWhere("user_id = :user_id", { user_id: userCognitoSub })
            .execute();
    }
}

export default CommentLikeRepository;