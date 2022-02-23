import {getRepository, QueryFailedError, UpdateResult} from 'typeorm';
import { Posts } from "../../../../database/postgresql/models/Posts";
import IPostRepository from "./IPostRepository";

type getPostsByUserCognitoSubReturnType = Promise<{
    id: number,
    userId: string,
    caption: string,
    status: string,
    viewCount: number,
    googleMapsPlaceId: string,
    locationDetails: string,
    postMediaFiles: { key: string, type: string }[],
    createdAt: number,
    updatedAt: number,
    deletedAt: number
}[]>;

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

        this._model.id = undefined; // prevent overwriting existing posts from the same user
        this._model.user_id = item.userCognitoSub;
        this._model.caption = item.caption;
        this._model.status = 'active';
        this._model.view_count = 0;
        this._model.google_maps_place_id = item.googlemapsPlaceId;
        this._model.s3_files = item.files;

        return this._model;
    }

    /**
     * Get all the user posts.
     * @param userCognitoSub: string
     * @returns getPostsByUserCognitoSubReturnType
     */
    getPostsByUserCognitoSub(userCognitoSub: string): getPostsByUserCognitoSubReturnType {
        return new Promise(async (resolve, reject) => {
            const posts = await getRepository(Posts)
                .createQueryBuilder('posts')
                .select('posts')
                .where('user_id = :userCognitoSub', { userCognitoSub })
                .getRawMany()
                .catch((error: QueryFailedError) => {
                    return reject(error);
                });

            // We expect the posts to be an array, other types are not allowed.
            if (Array.isArray(posts)) {

                const newPosts = posts.map((post: {
                    posts_id: number,
                    posts_user_id: string,
                    posts_caption: string,
                    posts_status: string,
                    posts_view_count: number,
                    posts_google_maps_place_id: string,
                    posts_location_details: string,
                    posts_s3_files: { key: string, type: string }[],
                    posts_created_at: number,
                    posts_updated_at: number,
                    posts_deleted_at: number
                }) => {
                    return {
                        id: post.posts_id,
                        userId: post.posts_user_id,
                        caption: post.posts_caption,
                        status: post.posts_status,
                        viewCount: post.posts_view_count,
                        googleMapsPlaceId: post.posts_google_maps_place_id,
                        locationDetails: post.posts_location_details,
                        postMediaFiles: post.posts_s3_files,
                        createdAt: post.posts_created_at,
                        updatedAt: post.posts_updated_at,
                        deletedAt: post.posts_deleted_at
                    }
                });

                return resolve(newPosts);
            }

            return reject('invalid type for posts gallery');
        });
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
            .set({caption})
            .where('id = :id', {id})
            .andWhere('deleted_at IS NULL')
            .execute();
    }

    /**
     * Performs soft delete for Posts
     * @param id: number
     * @returns Promise<boolean>
     */
    softDelete(id: number): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            await getRepository(Posts)
                .createQueryBuilder()
                .where("id = :id", {id})
                .softDelete()
                .execute()
                .catch((error: QueryFailedError) => {
                    return reject(error);
                });
            return resolve(true);
        })
    }
}

export default PostRepository;