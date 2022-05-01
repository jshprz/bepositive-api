import IFeedRepository from "../infras/repositories/IFeedRepository";
import Logger from '../../../config/Logger';
import Error from "../../../config/Error";
import { Client } from '@googlemaps/google-maps-services-js';

import IUserProfileRepository from "../../user-service/infras/repositories/IUserProfileRepository"; // External
import IPostLikeRepository from "../../content-service/infras/repositories/IPostLikeRepository"; // External
import IPostRepository from "../../content-service/infras/repositories/IPostRepository"; // External
import IPostShareRepository from "../../content-service/infras/repositories/IPostShareRepository"; // External

import { QueryFailedError } from "typeorm";
import type { feedTypes, postType, getPostLikeType } from '../../types';

class FeedFacade {
    private _log;
    private _googleapis;

    constructor(
        private _feedRepository: IFeedRepository,
        private _postLikeRepository: IPostLikeRepository,
        private _userProfileRepository: IUserProfileRepository,
        private _postRepository: IPostRepository,
        private _postShareRepository: IPostShareRepository
    ) {
        this._log = Logger.createLogger('FeedFacade.ts');
        this._googleapis = new Client({});
    }

    /**
     * Get the feed/s dedicated to a specific user.
     * @param userCognitoSub: string
     * @param pagination: {page: number, size: number}
     * @returns Promise<{
     *         message: string,
     *         data: feedTypes[],
     *         code: number
     *     }>
     */
    getFeed(userCognitoSub: string, pagination: {page: number, size: number}): Promise<{
        message: string,
        data: feedTypes[],
        code: number
    }> {

        return new Promise(async (resolve, reject) => {
            const feeds = await this._feedRepository.getFeed(pagination, userCognitoSub).catch((error: QueryFailedError) => {
                this._log.error({
                    function: 'getFeed()',
                    message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                    payload: {
                        userCognitoSub,
                        pagination
                    }
                });

                return reject({
                    message: Error.DATABASE_ERROR.GET,
                    code: 500
                });
            });

            if (Array.isArray(feeds)) {
                const feedBuilderPromises: Promise<feedTypes>[] = [];

                feeds.forEach((feed) => {
                    if (feed) {
                        feedBuilderPromises.push(this._feedBuilder(feed, userCognitoSub));
                    }
                });

                Promise.allSettled(feedBuilderPromises).then((results) => {

                    const tempFeedData = {
                        content: {
                            classification: '',
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
                            isSponsored: false,
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

                    const resultsMap = results.map(r => r.status !== 'rejected'? r.value : tempFeedData);

                    return resolve({
                        message: 'Feed successfully retrieved.',
                        data: resultsMap.filter(r => r !== null && r.content.postId !== '' && r.actor.userId !== ''),
                        code: 200
                    });
                });
            } else {
                return reject({
                    message: 'Invalid type for feed.',
                    code: 500
                });
            }
        });
    }

    /**
     * Get the trending feed/s.
     * @param pagination: {page: number, size: number}
     * @param popularityThreshold: number
     * @param userCognitoSub: string
     * @returns Promise<{
     *         message: string,
     *         data: feedTypes[],
     *         code: number
     *     }>
     */
    getTrendingFeed(pagination: {page: number, size: number}, popularityThreshold: number, userCognitoSub: string): Promise<{
        message: string,
        data: feedTypes[],
        code: number
    }> {
        return new Promise(async (resolve, reject) => {
            const trendingFeeds = await this._feedRepository.getTrendingFeed(pagination, popularityThreshold).catch((error: QueryFailedError) => {
                this._log.error({
                    function: 'getTrendingFeed()',
                    message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                    payload: {
                        pagination,
                        popularityThreshold
                    }
                });

                return reject({
                    message: Error.DATABASE_ERROR.GET,
                    code: 500
                });
            });

            if (Array.isArray(trendingFeeds)) {
                const feedBuilderPromises: Promise<feedTypes>[] = [];

                trendingFeeds.forEach((trendingFeed) => {
                    feedBuilderPromises.push(this._feedBuilder(trendingFeed, userCognitoSub));
                });

                const newTrendingFeedCollection = await Promise.all(feedBuilderPromises)
                    .catch((error: string) => {
                        this._log.error({
                            function: 'getTrendingFeed()',
                            message: error.toString(),
                            payload: {
                                pagination,
                                popularityThreshold
                            }
                        });

                        return reject({
                            message: 'Error occured while generating a feed.',
                            code: 500
                        });
                    });

                return resolve({
                    message: 'Trending feed successfully retrieved.',
                    data: (Array.isArray(newTrendingFeedCollection))? newTrendingFeedCollection : [],
                    code: 200
                });
            } else {
                return reject({
                    message: 'Invalid type for trendingFeeds.',
                    code: 500
                });
            }
        });
    }

    /**
     * Build the feed (append posts data, append post location details, post media files complete URL, post like status, and post user information).
     * @param feed: feedTypes
     * @returns Promise<feedTypes>
     */
    private _feedBuilder(feed: feedTypes, loggedInUserId: string = ''): Promise<feedTypes> {
        return new Promise(async (resolve, reject) => {
            try {
                if (feed && feed.content.postId) {

                    // Retrieve regular post data and append them to each of the respective feed property.
                    if (feed.content.classification === 'REGULAR_POST') {
                        const post: postType = await this._postRepository.getPostById(feed.content.postId).catch((error) => {
                            throw error;
                        });

                        if (post.content.attachments) {
                            const attachments = post.content.attachments.map((attachment) => {
                                return {
                                    key: attachment.key,
                                    url: '',
                                    type: attachment.type,
                                    height: '',
                                    width: ''
                                }
                            });

                            feed.actor.userId = post.actor.userId;
                            feed.content.caption = post.content.caption;
                            feed.content.googleMapsPlaceId = post.content.googleMapsPlaceId;
                            feed.content.attachments = attachments;
                            feed.content.createdAt = post.content.createdAt;
                            feed.content.updatedAt = post.content.updatedAt;
                            feed.content.originalPost = null;
                        }
                    }

                    // Retrieve shared post data and append them to each of the respective feed property.
                    if (feed.content.classification === 'SHARED_POST') {
                        const sharedPost = await this._postShareRepository.get(feed.content.postId).catch((error) => {
                            throw error;
                        });
                        const originalPost: postType = await this._postRepository.getPostById(sharedPost.postId).catch((error) => {
                            throw error;
                        });
                        feed.actor.userId = sharedPost.userId;
                        feed.content.caption = sharedPost.shareCaption;
                        feed.content.googleMapsPlaceId = '';
                        feed.content.attachments = null;
                        feed.content.createdAt = sharedPost.createdAt;
                        feed.content.updatedAt = sharedPost.updatedAt;

                        // Retrieve the original post based on the shared post,
                        // fulfill the data of the original post
                        if (feed.content.originalPost) {
                            if (originalPost.content.attachments) {
                                const originalPostAttachments = originalPost.content.attachments.map((attachment) => {
                                    return {
                                        key: attachment.key,
                                        url: '',
                                        type: attachment.type,
                                        height: '',
                                        width: ''
                                    }
                                });

                                feed.content.originalPost.actor.userId = originalPost.actor.userId;
                                feed.content.originalPost.content.postId = originalPost.content.postId;
                                feed.content.originalPost.content.caption = originalPost.content.caption;
                                feed.content.originalPost.content.googleMapsPlaceId = originalPost.content.googleMapsPlaceId;
                                feed.content.originalPost.content.attachments = originalPostAttachments;
                                feed.content.originalPost.content.createdAt = originalPost.content.createdAt;
                                feed.content.originalPost.content.updatedAt = originalPost.content.updatedAt;

                                // Retrieve original post location details.
                                if (feed.content.originalPost.content.googleMapsPlaceId) {
                                    const originalPostPlace = await this._googleapis.placeDetails({
                                        params: {
                                            place_id: feed.content.originalPost.content.googleMapsPlaceId,
                                            key: `${process.env.GOOGLE_MAPS_API_KEY}`
                                        }
                                    }).catch((error) => {
                                        throw error.stack;
                                    });
                                    feed.content.originalPost.content.locationDetails = `${originalPostPlace.data.result.name}, ${originalPostPlace.data.result.vicinity}`;
                                }

                                // To provide the complete URL of the original post attachments from S3 bucket.
                                if (feed.content.originalPost.content.attachments) {
                                    feed.content.originalPost.content.attachments.forEach((file) => {
                                        file.url = `${process.env.AWS_S3_BUCKET_URL}/${file.key}`; // S3 object file URL.
                                    });
                                }

                                // Get the user profile data of the original post.
                                if (feed.content.originalPost.actor) {
                                    const originalPostUserProfileData = await this._userProfileRepository.getUserProfileByUserId(feed.content.originalPost.actor.userId).catch((error) => {
                                        throw error;
                                    });

                                    feed.content.originalPost.actor.name = originalPostUserProfileData.name || '';
                                    feed.content.originalPost.actor.avatar.url = originalPostUserProfileData.avatar || '';
                                }
                            }
                        }
                    }

                    // Retrieve post location details of the post.
                    if (feed.content.googleMapsPlaceId) {
                        const place = await this._googleapis.placeDetails({
                            params: {
                                place_id: feed.content.googleMapsPlaceId,
                                key: `${process.env.GOOGLE_MAPS_API_KEY}`
                            }
                        }).catch((error) => {
                            throw error.stack;
                        });
                        feed.content.locationDetails = `${place.data.result.name}, ${place.data.result.vicinity}`;
                    }

                    // To provide the complete URL of the post attachments from S3 bucket.
                    if (feed.content.attachments) {
                        feed.content.attachments.forEach((file) => {
                            file.url = `${process.env.AWS_S3_BUCKET_URL}/${file.key}`; // S3 object file URL.
                        });
                    }

                    // To set the post like status - if the logged-in user liked the post or not.
                    if (feed.content.isLiked === false || feed.content.isLiked === true) {
                        const getPostLikeByUserIdResult: number | getPostLikeType = await this._postLikeRepository.getByIdAndUserId(feed.content.postId, loggedInUserId).catch((error) => {
                            throw error;
                        });
                        if (typeof getPostLikeByUserIdResult !== 'number') {
                            if (getPostLikeByUserIdResult.userId === feed.actor.userId) {
                                feed.content.isLiked = true;
                            } else {
                                feed.content.isLiked = false;
                            }
                        }
                    }

                    // Get the user profile data every post in the feed.
                    if (feed.actor) {
                        const userProfileData = await this._userProfileRepository.getUserProfileByUserId(feed.actor.userId).catch((error) => {
                            throw error;
                        });

                        feed.actor.name = userProfileData.name || '';
                        feed.actor.avatar.url = userProfileData.avatar || '';
                    }
                }

                return resolve(feed);
            } catch(error: any) {
                this._log.error({
                    function: '_feedBuilder()',
                    message: (error.includes('NOT_FOUND'))? 'Post not found' : `${error}`,
                    payload: {
                        feed,
                        loggedInUserId
                    }
                });

                return reject(error);
            }
        });
    }
}

export default FeedFacade;