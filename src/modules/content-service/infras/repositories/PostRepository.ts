import {getRepository, QueryFailedError, UpdateResult} from 'typeorm';
import { Posts } from "../../../../database/postgresql/models/Posts";
import { PostShares } from "../../../../database/postgresql/models/PostShares";
import { FlaggedPosts } from "../../../../database/postgresql/models/FlaggedPosts";
import type { postType, sharedPostType } from '../../../types';
import IPostRepository from "./IPostRepository";

class PostRepository implements IPostRepository {
    private readonly _model;
    private readonly _flaggedPostModel;

    constructor() {
        this._model = new Posts();
        this._flaggedPostModel = new FlaggedPosts();
    }

    /**
     * Creates post record in the database.
     * @param item: {userCognitoSub: string, caption: string, s3Files: {key: string, type: string}[] }
     * @returns instance of Posts
     */
    create(item: {userCognitoSub: string, caption: string, files: {key: string, type: string}[], googleMapsPlaceId: string }): Posts {

        this._model.id = undefined; // prevent overwriting existing posts from the same user
        this._model.user_id = item.userCognitoSub;
        this._model.caption = item.caption;
        this._model.status = 'active';
        this._model.view_count = 0;
        this._model.google_maps_place_id = item.googleMapsPlaceId;
        this._model.s3_files = item.files;

        return this._model;
    }

    /**
     * Get all the user posts.
     * @param userCognitoSub: string
     * @returns Promise<postType[]>
     */
    getPostsByUserCognitoSub(userCognitoSub: string): Promise<postType[]> {
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
                    posts_id: string,
                    posts_user_id: string,
                    posts_caption: string,
                    posts_status: string,
                    posts_view_count: number,
                    posts_google_maps_place_id: string,
                    posts_location_details: string,
                    posts_s3_files: { key: string, type: string }[],
                    posts_created_at: Date,
                    posts_updated_at: Date
                }) => {
                    return {
                        content: {
                            classification: 'REGULAR_POST',
                            postId: post.posts_id,
                            caption: post.posts_caption,
                            googleMapsPlaceId: post.posts_google_maps_place_id,
                            locationDetails: post.posts_location_details,
                            attachments: (post && Array.isArray(post.posts_s3_files))? post?.posts_s3_files.map((r) => {
                                return {
                                    key: r.key,
                                    url: '',
                                    type: r.type,
                                    height: '',
                                    width: ''
                                }
                            }) : [{
                                key: '',
                                url: '',
                                type: '',
                                height: '',
                                width: ''
                            }],
                            createdAt: post.posts_created_at,
                            updatedAt: post.posts_updated_at,
                        },
                        actor: {
                            userId: post.posts_user_id,
                            name: '',
                            avatar: {
                                url: '',
                                type: '',
                                height: '',
                                width: ''
                            }
                        }
                    }
                });

                return resolve(newPosts);
            }

            return reject('invalid type for posts gallery');
        });
    }

    /**
     * Get a post by id.
     * @param id: string
     * @returns Promise<postType>
     */
    getPostById(id: string): Promise<postType> {
        return new Promise(async (resolve, reject) => {
            const post = await getRepository(Posts)
                .createQueryBuilder('posts')
                .select('posts')
                .where('id = :id', {id})
                .getOne()
                .catch((error: QueryFailedError) => {
                    return reject(error);
                });

            const newPost = {
                content: {
                    classification: 'REGULAR_POST',
                    postId: post?.id || '',
                    caption: post?.caption || '',
                    googleMapsPlaceId: post?.google_maps_place_id || '',
                    locationDetails: post?.location_details || '',
                    attachments: (post && Array.isArray(post.s3_files))? post?.s3_files.map((r) => {
                        return {
                            key: r.key,
                            url: '',
                            type: r.type,
                            height: '',
                            width: ''
                        }
                    }) : [{
                        key: '',
                        url: '',
                        type: '',
                        height: '',
                        width: ''
                    }],
                    createdAt: post?.created_at || 0,
                    updatedAt: post?.updated_at || 0,
                },
                actor: {
                    userId: post?.user_id || '',
                    name: '',
                    avatar: {
                        url: '',
                        type: '',
                        height: '',
                        width: ''
                    }
                }
            }

            return resolve(newPost);
        });
    }

    /**
     * Get a shared post by shared post id.
     * @param id: string
     * @returns Promise<postType>
     */
    getSharedPostById(id: string): Promise<sharedPostType> {
        return new Promise(async (resolve, reject) => {
            const post = await getRepository(PostShares)
                .createQueryBuilder('post_shares')
                .select('post_shares')
                .where('id = :id', {id})
                .getOne()
                .catch((error: QueryFailedError) => {
                    return reject(error);
                });

            const newPost = {
                id: post?.id || '',
                postId: post?.post_id || '',
                userId: post?.user_id || '',
                shareCaption: post?.share_caption || '',
                createdAt: post?.created_at || 0,
                updatedAt: post?.updated_at || 0
            }

            return resolve(newPost);
        });
    }

    /**
     * Updates a post from posts table.
     * @param id: string
     * @param caption: string
     * @returns Promise<UpdateResult>
     */
    update(id: string, caption: string): Promise<UpdateResult> {

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
     * @param postId: string
     * @returns Promise<boolean>
     */
    softDelete(postId: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {

            await getRepository(Posts)
                .createQueryBuilder()
                .where("id = :postId", { postId })
                .softDelete()
                .execute()
                .catch((error: QueryFailedError) => {
                    return reject(error);
                });

            return resolve(true);
        });
    }

    /**
     * Creates flagged post record in the database.
     * @param userCognitoSub: string
     * @param postId: string
     * @param classification: string,
     * @param reason: string}
     * @returns instance of FlaggedPosts
     */
    flagPost(userCognitoSub: string, postId: string, classification: string, reason: string): FlaggedPosts {

        this._flaggedPostModel.id = undefined; // prevent overwriting existing entry from the same user
        this._flaggedPostModel.user_id = userCognitoSub;
        this._flaggedPostModel.post_id = postId;
        this._flaggedPostModel.classification = classification;
        this._flaggedPostModel.reason = reason;

        return this._flaggedPostModel;
    }
}

export default PostRepository;