import { getRepository, DeleteResult, QueryFailedError } from "typeorm";
import { PostLikes } from "../../../../database/postgresql/models/PostLikes";
import IPostLikeRepository from "./IPostLikeRepository";
import type { getPostLikeType } from "../../../types";

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
     * @returns Promise<getPostLikeType | number>
     */
    getByIdAndUserId(postId: string, userCognitoSub: string): Promise<getPostLikeType | number> {

        return new Promise(async (resolve, reject) => {
            const postLike = await getRepository(PostLikes)
                .createQueryBuilder('postlikes')
                .select('postlikes')
                .where('post_id = :postId', {postId})
                .andWhere('user_id = :userCognitoSub', {userCognitoSub})
                .getOne()
                .catch((error: QueryFailedError) => {
                    return reject(error);
                });
            if (postLike) {
                return resolve({
                    id: postLike.id || '',
                    postId: postLike.post_id || '',
                    userId: postLike.user_id || '',
                    createdAt: postLike.created_at || 0,
                    updatedAt: postLike.updated_at || 0
                });
            } else {
                return resolve(0);
            }
        });
    }

    /**
     * Get PostLike by User ID.
     * @param userId: string
     * @returns Promise<getPostLikeType[]>
     */
    getByUserId(userId: string): Promise<getPostLikeType[]> {

        return  new Promise(async (resolve, reject) => {
            const postLike = await getRepository(PostLikes)
                .createQueryBuilder('post_likes')
                .select('post_likes')
                .where('user_id = :userId', { userId })
                .addOrderBy('created_at', 'DESC')
                .getMany()
                .catch((error) => {
                    return reject(error);
                });

            if (postLike) {
                const newPostLike = postLike.map((item) => {
                    return {
                        id: item.id || '',
                        postId: item.post_id || '',
                        userId: item.user_id || '',
                        createdAt: item.created_at || 0,
                        updatedAt: item.updated_at || 0
                    }
                });

                return resolve(newPostLike);
            } else {
                return reject(`Unable to retrieve postlike: ${postLike}`);
            }
        });
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