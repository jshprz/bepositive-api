import { getRepository, UpdateResult, QueryFailedError } from "typeorm";
import { PostShares } from "../../../../database/postgresql/models/PostShares";
import IPostShareRepository from "./IPostShareRepository";
import type { getByIdAndUserCognitoSubReturnTypes } from '../../../types';
import { sharedPostType } from "../../../types";
import {Posts} from "../../../../database/postgresql/models/Posts";

class PostShareRepository implements IPostShareRepository {

    private readonly _model;

    constructor() {
        this._model = new PostShares();
    }

    /**
     * Creates post share  record.
     * @param item: { userId: string, postId: string, shareCaption: string }
     * @returns instance of PostShares
     */
    create(item: { userId: string, postId: string, shareCaption: string }): PostShares {

        this._model.id = undefined; // prevent overwriting existing comments from the same user
        this._model.post_id = item.postId;
        this._model.user_id = item.userId;
        this._model.share_caption = item.shareCaption;

        return this._model;
    }

    /**
     * Gets a shared post by ID.
     * @param id: string
     * @returns Promise<sharedPostType>
     */
    get(id: string): Promise<sharedPostType> {

        return new Promise(async (resolve, reject) => {
            const sharedPost = await getRepository(PostShares)
                .createQueryBuilder('post_shares')
                .select('post_shares')
                .where('id = :id', {id})
                .getOne()
                .catch((error: QueryFailedError) => {
                    return reject(error);
                });

            if (sharedPost) {
                return resolve({
                    id: String(sharedPost.id),
                    postId: String(sharedPost.post_id),
                    userId: String(sharedPost.user_id),
                    shareCaption: String(sharedPost.share_caption),
                    createdAt: sharedPost?.created_at || new Date(),
                    updatedAt: sharedPost?.updated_at || new Date()
                });
            } else {
                return reject('SHARED_POST_NOT_FOUND');
            }
        });
    }

    /**
     * Gets a shared post by ID and user cognito sub.
     * @param id: string
     * @param userCognitoSub: string
     * @returns Promise<getByIdAndUserCognitoSubReturnTypes>
     */
    getByIdAndUserCognitoSub(id: string, userCognitoSub: string): Promise<getByIdAndUserCognitoSubReturnTypes> {
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
                id: sharedPost?.id || '',
                postId: sharedPost?.post_id || '',
                userId: sharedPost?.user_id || '',
                shareCaption: sharedPost?.share_caption || '',
                createdAt: sharedPost?.created_at || new Date(),
                updatedAt: sharedPost?.updated_at || new Date(),
                deletedAt: sharedPost?.deleted_at || new Date()
            });
        });
    }

    /**
     * Updates a shared post.
     * @param id: string
     * @param shareCaption: string
     * @returns Promise<UpdateResult>
     */
    update(id: string, shareCaption: string): Promise<UpdateResult> {

        return getRepository(PostShares)
            .createQueryBuilder()
            .update(PostShares)
            .set({share_caption: shareCaption})
            .where('id = :id', { id })
            .execute();
    }

    /**
     * Performs soft delete for shared post.
     * @param postId: string
     * @returns Promise<boolean>
     */
    softDelete(postId: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            await getRepository(PostShares)
                .createQueryBuilder()
                .where("id = :postId", { postId })
                .softDelete()
                .execute()
                .catch((error: QueryFailedError) => {
                    return reject(error);
                });
            return resolve(true);
        })
    }
}

export default PostShareRepository;