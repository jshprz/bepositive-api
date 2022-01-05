import { getRepository, DeleteResult } from "typeorm";
import { PostLikes } from "../../../../database/postgresql/models/PostLikes";
import IPostLikeRepository from "./IPostLikeRepository";

class PostLikeRepository implements IPostLikeRepository {
    private readonly _model;

    constructor() {
        this._model = new PostLikes();
    }

    /**
     * Creates post_like record in the database.
     * @param item: {userCognitoSub: string, postId: number}
     * @returns instance of PostLikes
     */
    create(item: {userCognitoSub: string, postId: number}) {

            this._model.user_id = item.userCognitoSub;
            this._model.post_id = item.postId;
            this._model.created_at = Number(Date.now());

            return this._model;
    }

    /**
     * Get a PostLike by id and user id
     * @param postId: number
     * @param userCognitoSub: string
     * @returns Promise<any>
     */
    getByIdAndUserId(postId: number, userCognitoSub: string): Promise<any> {

        return getRepository(PostLikes)
            .createQueryBuilder('postlikes')
            .select('postlikes')
            .where('post_id = :postId', {postId})
            .andWhere('user_id = :userCognitoSub', {userCognitoSub})
            .getOne();
    }

    /**
     * Deletes post_like record in the database.
     * @param postId: number
     * @param userCognitoSub: string
     * @returns Promise<DeleteResult>
     */
    deleteByIdAndUserId(postId: number, userCognitoSub: string): Promise<DeleteResult> {

        return getRepository(PostLikes)
            .createQueryBuilder()
            .delete()
            .from(PostLikes)
            .where("post_id = :post_id", { post_id: postId })
            .andWhere("user_id = :user_id", { user_id: userCognitoSub })
            .execute();
    }
}

export default PostLikeRepository;