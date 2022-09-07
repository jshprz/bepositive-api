import { getRepository, QueryFailedError } from 'typeorm';
import { UserFeeds } from "../../database/postgresql/models/UserFeeds";
import { Posts } from "../../database/postgresql/models/Posts";
import IFeedRepository from "./interfaces/IFeedRepository";
import type { feedTypes, feedRawType } from '../../modules/feed-service/types';

class FeedRepository implements IFeedRepository {
    private readonly _model;

    constructor() {
        this._model = new UserFeeds();
    }

    /**
     * Creates a follower's feed for regular post.
     * @param followeeId: string
     * @param postId: string
     * @returns UserFeeds
     */
    create(followeeId: string, postId: string, isRegularPost: boolean = false): UserFeeds {

        this._model.id = undefined; // prevent overwriting existing comments from the same user
        this._model.user_id = followeeId;
        this._model.post_id = postId;
        this._model.classification = (isRegularPost)? 'REGULAR_POST' : 'SHARED_POST';

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

            const feeds: UserFeeds[] | void = await getRepository(UserFeeds)
                .createQueryBuilder('user_feeds')
                .select('user_feeds')
                .where('user_id = :userId', { userId: userCognitoSub })
                .orderBy({
                    'created_at': 'DESC'
                })
                .take(pagination.size)
                .skip(pagination.size * (pagination.page - 1))
                .getMany()
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
                        content: {
                            classification: 'REGULAR_POST',
                            postId: trendingFeed?.id || '',
                            caption: trendingFeed?.caption || '',
                            googleMapsPlaceId: trendingFeed?.google_maps_place_id || '',
                            locationDetails: trendingFeed?.location_details || '',
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
                            createdAt: trendingFeed?.created_at || new Date(),
                            updatedAt: trendingFeed?.updated_at || new Date(),
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
                });

                return resolve(newFeedStructure);
            } else {
                return reject('Invalid data type for feed.');
            }
        });
    }

    /**
     * Get feed by Post ID.
     * @param postId
     * @returns Promise<feedRawType[]>
     */
    getFeedsByPostId(postId: string): Promise<feedRawType[]> {

        return new Promise(async (resolve, reject) => {

            const feeds = await getRepository(UserFeeds)
                .createQueryBuilder('user_feeds')
                .select('user_feeds')
                .where('post_id = :postId', { postId })
                .getMany()
                .catch((error) => {
                    return reject(error);
                });

            if (feeds) {
                const newFeeds = feeds.map((feed) => {
                    return {
                        id: feed.id || '',
                        userId: feed.user_id || '',
                        postId: feed.post_id || '',
                        classification: feed.classification || '',
                        createdAt: feed.created_at || 0,
                        updatedAt: feed.updated_at || 0
                    }
                });

                return resolve(newFeeds);
            } else {
                return reject(`Unable to retrieve feed: ${feeds}`);
            }
        });
    }

    /**
     * Soft delete a feed by its ID.
     * @param id: string
     * @returns Promise<boolean>
     */
    softDeleteFeedById(id: string): Promise<boolean> {

        return new Promise(async (resolve, reject) => {
            await getRepository(UserFeeds)
                .createQueryBuilder('user_feeds')
                .where("id = :id", { id })
                .softDelete()
                .execute()
                .catch((error: QueryFailedError) => {
                    return reject(error);
                });
            return resolve(true);
        });
    }
}

export default FeedRepository;