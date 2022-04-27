import {getRepository, QueryFailedError, getManager} from 'typeorm';
import { UserFeedPost } from "../../../../database/postgresql/models/UserFeedPost";
import { Posts } from "../../../../database/postgresql/models/Posts";
import IFeedRepository from "./IFeedRepository";
import type { feedTypes } from '../../../types';
import { UserFeedSharedPost } from "../../../../database/postgresql/models/UserFeedSharedPost";
import {feedTypesTemp} from "../../../types";

class FeedRepository implements IFeedRepository {
    private readonly _modelFeedRegularPost;
    private readonly _modelFeedSharedPost;

    constructor() {
        this._modelFeedRegularPost = new UserFeedPost();
        this._modelFeedSharedPost = new UserFeedSharedPost();
    }

    /**
     * Creates a follower's feed for regular post.
     * @param followeeId: string
     * @param postId: string
     * @returns UserFeedPost
     */
    createFeedForRegularPost(followeeId: string, postId: string): UserFeedPost {

        this._modelFeedRegularPost.id = undefined; // prevent overwriting existing comments from the same user
        this._modelFeedRegularPost.user_id = followeeId;
        this._modelFeedRegularPost.post_id = postId;
        this._modelFeedRegularPost.classification = 'REGULAR_POST';

        return this._modelFeedRegularPost;
    }

    /**
     * Creates a follower's feed for shared post.
     * @param followeeId: string
     * @param sharedPostId: string
     * @returns UserFeedSharedPost
     */
    createFeedForSharedPost(followeeId: string, sharedPostId: string): UserFeedSharedPost {

        this._modelFeedSharedPost.id = undefined; // prevent overwriting existing comments from the same user
        this._modelFeedSharedPost.user_id = followeeId;
        this._modelFeedSharedPost.shared_post_id = sharedPostId;
        this._modelFeedSharedPost.classification = 'SHARED_POST';

        return this._modelFeedSharedPost;
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

            const feeds: {
                id: string,
                user_id: string,
                post_id: string,
                classification: string,
                created_at: Date | number,
                updated_at: Date | number,
                deleted_at: Date | number
            }[] = await getManager()
                .query(`
                    SELECT * FROM user_feed_post
                    WHERE user_id = '${userCognitoSub}'
                    UNION
                    SELECT * FROM user_feed_shared_post
                    WHERE user_id = '${userCognitoSub}'
                    ORDER BY created_at DESC
                    OFFSET ${(page - 1) * size} ROWS FETCH NEXT ${size} ROWS ONLY
                    `)
                .catch((error: QueryFailedError) => {
                    return reject(error);
                });

            if (Array.isArray(feeds)) {
                const newFeedStructure = feeds.map((feed) => {
                    const classification = feed.classification;
                    switch (classification) {
                        case 'REGULAR_POST':
                            return {
                                content: {
                                    classification: feed?.classification || '',
                                    postId: feed?.post_id || '',
                                    caption: '',
                                    googleMapsPlaceId: '',
                                    locationDetails: '',
                                    attachments: [{
                                        key: '',
                                        url: '',
                                        type: '',
                                        height: '',
                                        width: ''
                                    }],
                                    originalPost: null,
                                    isLiked: false,
                                    isSponsored: null,
                                    createdAt: 0,
                                    updatedAt: 0,
                                },
                                actor: {
                                    userId: '',
                                    name: '',
                                    avatar: {
                                        url: '',
                                        type: '',
                                        height: '',
                                        width: ''
                                    }
                                }
                            }
                        case 'SHARED_POST':
                            return {
                                content: {
                                    classification: feed?.classification || '',
                                    postId: feed?.post_id || '',
                                    caption: '',
                                    googleMapsPlaceId: '',
                                    locationDetails: '',
                                    attachments: [{
                                        key: '',
                                        url: '',
                                        type: '',
                                        height: '',
                                        width: ''
                                    }],
                                    originalPost: {
                                        content: {
                                            postId: '',
                                            caption: '',
                                            googleMapsPlaceId: '',
                                            locationDetails: '',
                                            attachments: [{
                                                key: '',
                                                url: '',
                                                type: '',
                                                height: '',
                                                width: ''
                                            }],
                                            createdAt: 0,
                                            updatedAt: 0
                                        },
                                        actor: {
                                            userId: '',
                                            name: '',
                                            avatar: {
                                                url: '',
                                                type: '',
                                                height: '',
                                                width: ''
                                            }
                                        }
                                    },
                                    isLiked: false,
                                    isSponsored: null,
                                    createdAt: 0,
                                    updatedAt: 0,
                                },
                                actor: {
                                    userId: '',
                                    name: '',
                                    avatar: {
                                        url: '',
                                        type: '',
                                        height: '',
                                        width: ''
                                    }
                                }
                            }
                        default:
                            return null;
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
    getTrendingFeed(pagination: {page: number, size: number}, threshold: number): Promise<feedTypesTemp[]> {
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
                        id: trendingFeed?.id || '',
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