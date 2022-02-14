import { getRepository, UpdateResult, QueryFailedError } from "typeorm";
import { PostShares } from "../../../../database/postgresql/models/PostShares";
import IPostShareRepository from "./IPostShareRepository";

type getByIdAndUserCognitoSubReturnTypes = {
    id: number,
    postId: number,
    userId: string,
    shareCaption: string,
    createdAt: bigint | number,
    updatedAt: bigint | number,
    deletedAt: bigint | number
}

class PostShareRepository implements IPostShareRepository {

    private readonly _model;

    constructor() {
        this._model = new PostShares();
    }

    /**
     * Creates post share  record.
     * @param item: { userId: string, postId: number, shareCaption: string }
     * @returns instance of PostShares
     */
    create(item: { userId: string, postId: number, shareCaption: string }): PostShares {

        this._model.id = undefined; // prevent overwriting existing comments from the same user
        this._model.post_id = item.postId;
        this._model.user_id = item.userId;
        this._model.share_caption = item.shareCaption;
        this._model.created_at = Number(Date.now());

        return this._model;
    }

    /**
     * Gets a shared post by ID.
     * @param id: number
     * @returns Promise<any>
     */
    get(id: number): Promise<any> {

        return getRepository(PostShares)
            .createQueryBuilder('post_shares')
            .select('post_shares')
            .where('id = :id', {id})
            .getOne();
    }

    /**
     * Gets a shared post by ID and user cognito sub.
     * @param id: number
     * @param userCognitoSub: string
     * @returns Promise<getByIdAndUserCognitoSubReturnTypes>
     */
    getByIdAndUserCognitoSub(id: number, userCognitoSub: string): Promise<getByIdAndUserCognitoSubReturnTypes> {
        return new Promise(async (resolve, reject) => {

            const sharedPost = await getRepository(PostShares)
                .createQueryBuilder('post_shares')
                .select('post_shares')
                .where('id = :id', { id })
                .andWhere('user_id = :userCognitoSub', { userCognitoSub })
                .getOne()
                .catch((error: QueryFailedError) => {
                    return reject(error);
                });

            return resolve({
                id: sharedPost?.id || 0,
                postId: sharedPost?.post_id || 0,
                userId: sharedPost?.user_id || '',
                shareCaption: sharedPost?.share_caption || '',
                createdAt: sharedPost?.created_at || 0,
                updatedAt: sharedPost?.updated_at || 0,
                deletedAt: sharedPost?.deleted_at || 0
            });
        });
    }

    /**
     * Updates a shared post.
     * @param id: number
     * @param shareCaption: string
     * @returns Promise<UpdateResult>
     */
    update(id: number, shareCaption: string): Promise<UpdateResult> {

        return getRepository(PostShares)
            .createQueryBuilder()
            .update(PostShares)
            .set({share_caption: shareCaption})
            .where('id = :id', { id })
            .execute();
    }
}

export default PostShareRepository;