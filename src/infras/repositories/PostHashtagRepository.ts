import IPostHashtagRepository from "./interfaces/IPostHashtagRepository";
import { PostsHashtags } from "../../database/postgresql/models/PostsHashtags";
import { getRepository } from "typeorm";
import type { postsHashtagsType } from '../../modules/types';


class PostHashtagRepository implements IPostHashtagRepository {
    private readonly _model;

    constructor() {
        this._model = new PostsHashtags();
    }


    /**
     * Creates post-hashtag record in the database.
     * (PostsHashtags table is the junction table between posts table and hashtags table).
     * @param hashtagId: string
     * @param postId: string
     * @returns instance of Hashtags
     */
    create(hashtagId: string, postId: string): PostsHashtags {
        this._model.id = undefined; // prevent overwriting existing posts from the same user
        this._model.post_id = postId;
        this._model.hashtag_id = hashtagId;

        return this._model;
    }


    /**
     * Check if the post-hashtag is already existing in the database.
     * @param hashtagId: string
     * @param postId: string
     * @returns Promise<boolean>
     */
    isPostHashtagExist(hashtagId: string, postId: string): Promise<boolean> {

        return new Promise(async (resolve, reject) => {
            const postHashtag = await getRepository(PostsHashtags)
                .createQueryBuilder('posts_hashtags')
                .select('posts_hashtags')
                .where('post_id = :postId', { postId })
                .andWhere('hashtag_id = :hashtagId', { hashtagId })
                .getOne()
                .catch((error) => {
                    return resolve(false);
                });

            if (postHashtag) {
                return resolve((postHashtag.hashtag_id === hashtagId && postHashtag.post_id === postId)? true : false);
            } else {
                return resolve(false);
            }
        });
    }

    /**
     * Get hashtag by ID.
     * @param hashtagId: string
     * @param pagination: {page: number, size: number}
     * @returns Promise<postsHashtagsType[]>
     */
    getByHashtagId(hashtagId: string, pagination: {page: number, size: number}): Promise<postsHashtagsType[]> {

        return new Promise(async (resolve, reject) => {
            const postsHashtags = await getRepository(PostsHashtags)
                .createQueryBuilder('posts_hashtags')
                .select('posts_hashtags')
                .where('hashtag_id = :hashtagId', { hashtagId })
                .take(pagination.size)
                .skip(pagination.size * (pagination.page - 1))
                .getMany()
                .catch((error) => {
                    return reject(error);
                });

            if (postsHashtags) {
                const newPostsHashtags = postsHashtags.map((item) => {
                    return {
                        id: item.id || '',
                        postId: item.post_id || '',
                        hashtagId: item.hashtag_id || '',
                        createdAt: item.created_at || 0,
                        updatedAt: item.updated_at || 0
                    }
                });

                return resolve(newPostsHashtags);
            }

            return reject(`Unable to retrieve PostsHashtags: ${postsHashtags}`);
        });
    }
}

export default PostHashtagRepository;