import { getRepository } from 'typeorm';
import { UserFeeds } from "../../../../database/postgresql/models/UserFeeds";
import { Posts } from "../../../../database/postgresql/models/Posts";

class FeedRepository {
    private readonly _model;

    constructor() {
        this._model = new UserFeeds();
    }

    /**
     * Creates a follower's feed.
     * @param userId: string
     * @param postId: number | undefined
     * @returns instance of UserFeeds
     */
    create(userId: string, postId: number | undefined) {

        this._model.user_id = userId;
        this._model.post_id = postId;
        this._model.created_at = Number(Date.now());

        return this._model;
    }

    /**
     * Retrieve feed from user followings.
     * @param pagination: {page: number, size: number}
     * @param followings: string[] | any,
     * @returns Promise<any>
     */
    getFeed(pagination: {page: number, size: number}, followings: string[] | any): Promise<any> {
        const {page, size} = pagination;

        return getRepository(Posts)
            .createQueryBuilder('posts')
            .skip((page - 1) * size)
            .take(size)
            .where(qb => {
                const subQuery = qb.subQuery()
                    .select("user_feeds.post_id")
                    .from(UserFeeds, "user_feeds")
                    .where("user_feeds.user_id IN (:...followings)", {followings})
                    .getQuery();
                return "posts.id IN " + subQuery + " order by posts.created_at desc";
            }).getMany();
    }

    /**
     * Retrieves feed from current trends.
     * @param pagination: {page: number, size: number}
     * @param threshold: number
     * @returns Promise<any>
     */
    getTrendingFeed(pagination: {page: number, size: number}, threshold: number): Promise<any> {
        const {page, size} = pagination;

        return getRepository(Posts)
            .createQueryBuilder('posts')
            .skip((page - 1) * size)
            .take(size)
            .select(['posts.*', 'COUNT(post_likes.post_id) as likes'])
            .addFrom('PostLikes', 'post_likes')
            .where('post_likes.post_id = posts.id')
            .having('COUNT(post_likes.post_id) >= :threshold', {threshold})
            .groupBy('posts.id')
            .addGroupBy('posts.user_id')
            .orderBy('likes', 'DESC')
            .getRawMany();
    }
}

export default FeedRepository;