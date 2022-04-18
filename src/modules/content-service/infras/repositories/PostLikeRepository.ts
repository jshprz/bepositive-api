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
     * @param userCognitoSub: string
     * @param postId: string
     * @param classification: string
     * @returns instance of PostLikes
     */
    create(userCognitoSub: string, postId: string, classification: string): PostLikes {

        this._model.id = undefined; // prevent overwriting existing comments from the same user
        this._model.user_id = userCognitoSub;
        this._model.post_id = postId;
        this._model.classification = classification;

        return this._model;
    }

    /**
     * Get a PostLike by id and user id
     * @param postId: string
     * @param userCognitoSub: string
     * @returns Promise<any>
     */
    getByIdAndUserId(postId: string, userCognitoSub: string): Promise<any> {

        return getRepository(PostLikes)
            .createQueryBuilder('post_likes')
            .select('post_likes')
            .where('post_id = :postId', {postId})
            .andWhere('user_id = :userCognitoSub', {userCognitoSub})
            .getOne();
    }

    /**
     * Deletes post_like record in the database.
     * @param postId: string
     * @param userCognitoSub: string
     * @returns Promise<DeleteResult>
     */
    deleteByIdAndUserId(postId: string, userCognitoSub: string): Promise<DeleteResult> {

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