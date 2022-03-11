import {getRepository, QueryFailedError} from 'typeorm';
import { UserFeeds } from "../../../../database/postgresql/models/UserFeeds";
import { Posts } from "../../../../database/postgresql/models/Posts";
import IFeedRepository from "./IFeedRepository";
import type { feedTypes } from '../../../types';

class FeedRepository implements IFeedRepository{
    private readonly _model;

    constructor() {
        this._model = new UserFeeds();
    }

    /**
     * Creates a follower's feed.
     * @param userId: string
     * @param postId: number
     * @returns UserFeeds
     */
    create(followeeId: string, postId: number): UserFeeds {

        this._model.id = undefined; // prevent overwriting existing comments from the same user
        this._model.user_id = followeeId;
        this._model.post_id = postId;

        return this._model;
    }

    /**
     * Retrieve feed from user followings.
     * @param pagination: {page: number, size: number}
     * @param userCognitoSub: string,
     * @returns Promise<feedTypes[]>
     */
    getFeed(pagination: {page: number, size: number}, userCognitoSub: string): Promise<feedTypes[]> {
        return new Promise(async (resolve, reject) => {
            const {page, size} = pagination;

            const feeds = await getRepository(Posts)
                .createQueryBuilder('posts')
                .skip((page - 1) * size)
                .take(size)
                .where(qb => {
                    const subQuery = qb.subQuery()
                        .select("user_feeds.post_id")
                        .from(UserFeeds, "user_feeds")
                        .where("user_feeds.user_id = :userCognitoSub", {userCognitoSub})
                        .getQuery();
                    return "posts.id IN " + subQuery;
                })
                .orderBy('posts.created_at', 'DESC')
                .getMany()
                .catch((error: QueryFailedError) => {
                    return reject(error);
                });

            if (Array.isArray(feeds)) {
                const newFeedStructure = feeds.map((feed) => {
                    return {
                        id: feed?.id || 0,
                        userId: feed?.user_id || '',
                        caption: feed?.caption || '',
                        status: feed?.status || '',
                        viewCount: feed?.view_count || 0,
                        googleMapsPlaceId: feed?.google_maps_place_id || '',
                        locationDetails: feed?.location_details || '',
                        postMediaFiles: feed?.s3_files || [{key: '', type: ''}],
                        createdAt: feed?.created_at || new Date(),
                        updatedAt: feed?.updated_at || new Date(),
                        user: {}
                    }
                });

                return resolve(newFeedStructure);
            } else {
                return reject('Invalid data type for feed.');
            }
        });
    }

    /**
     * Retrieves feed from current trends.
     * @param pagination: {page: number, size: number}
     * @param threshold: number
     * @returns Promise<feedTypes[]>
     */
    getTrendingFeed(pagination: {page: number, size: number}, threshold: number): Promise<feedTypes[]> {
        return new Promise(async (resolve, reject) => {
            const {page, size} = pagination;

            const trendingFeeds = await getRepository(Posts)
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
                .getRawMany()
                .catch((error: QueryFailedError) => {
                    return reject(error);
                });

            if (Array.isArray(trendingFeeds)) {
                const newFeedStructure = trendingFeeds.map((trendingFeed) => {
                    return {
                        id: trendingFeed?.id || 0,
                        userId: trendingFeed?.user_id || '',
                        caption: trendingFeed?.caption || '',
                        status: trendingFeed?.status || '',
                        viewCount: trendingFeed?.view_count || 0,
                        googleMapsPlaceId: trendingFeed?.google_maps_place_id || '',
                        locationDetails: trendingFeed?.location_details || '',
                        postMediaFiles: trendingFeed?.s3_files || [{key: '', type: ''}],
                        createdAt: trendingFeed?.created_at || new Date(),
                        updatedAt: trendingFeed?.updated_at || new Date(),
                        user: {}
                    }
                });

                return resolve(newFeedStructure);
            } else {
                return reject('Invalid data type for feed.');
            }
        });
    }
}

export default FeedRepository;