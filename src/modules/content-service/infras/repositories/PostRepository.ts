import { getRepository, UpdateResult } from 'typeorm';
import { Posts } from "../../../../database/postgresql/models/Posts";
import IPostRepository from "./IPostRepository";

class PostRepository implements IPostRepository {
    private readonly _model;

    constructor() {
        this._model = new Posts();
    }

    /**
     * Creates post record in the database.
     * @param item: {userCognitoSub: string, caption: string, s3Files: {key: string, type: string}[] }
     * @returns instance of Posts
     */
    create(item: {userCognitoSub: string, caption: string, files: {key: string, type: string}[], googlemapsPlaceId: string }): Posts {

        this._model.user_id = item.userCognitoSub;
        this._model.caption = item.caption;
        this._model.status = 'active';
        this._model.view_count = 0;
        this._model.google_maps_place_id = item.googlemapsPlaceId;
        this._model.s3_files = item.files;
        this._model.created_at = Number(Date.now());

        return this._model;
    }

    /**
     * Gets user posts.
     * @param userCognitoSub: string
     * @returns Promise<any>
     */
    getPostsByUserCognitoSub(userCognitoSub: string): Promise<any> {
        return getRepository(Posts)
            .createQueryBuilder('posts')
            .select('posts')
            .where('user_id = :userCognitoSub', { userCognitoSub })
            .getRawMany();
    }

    /**
     * Get a post by id.
     * @param id: number
     * @returns Promise<any>
     */
    getPostById(id: number): Promise<any> {

        return getRepository(Posts)
            .createQueryBuilder('posts')
            .select('posts')
            .where('id = :id', {id})
            .andWhere('deleted_at IS NULL')
            .andWhere('status != :status', {status: 'deleted'})
            .getOne();
    }

    /**
     * Updates a post from posts table.
     * @param id: number
     * @param caption: string
     * @returns Promise<UpdateResult>
     */
    update(id: number, caption: string): Promise<UpdateResult> {

        return getRepository(Posts)
            .createQueryBuilder('posts')
            .update(Posts)
            .set({
                caption,
                updated_at: Number(Date.now())
            })
            .where('id = :id', {id})
            .andWhere('deleted_at IS NULL')
            .andWhere('status != :status', {status: 'deleted'})
            .execute();
    }

    /**
     * Removes a post by id.
     * @param id: number
     * @returns Promise<UpdateResult>
     */
    removePostById(id: number): Promise<UpdateResult> {

        return getRepository(Posts)
            .createQueryBuilder('posts')
            .update(Posts)
            .set({
                status: 'deleted',
                deleted_at: Number(Date.now())
            })
            .where('id = :id', {id})
            .execute();
    }
}

export default PostRepository;