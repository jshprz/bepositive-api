import IFeedRepository from "../infras/repositories/IFeedRepository";
import Logger from '../../../config/Logger';
import Error from "../../../config/Error";
import { Client } from '@googlemaps/google-maps-services-js';

import IUserProfileRepository from "../../../infras/repositories/interfaces/IUserProfileRepository"; // External
import IPostLikeRepository from "../../../infras/repositories/interfaces/IPostLikeRepository"; // External
import IPostRepository from "../../../infras/repositories/interfaces/IPostRepository"; // External
import IPostShareRepository from "../../../infras/repositories/interfaces/IPostShareRepository"; // External
import IAdvertisementRepository from "../../advertisement-service/infras/repositories/IAdvertisementRepository"; // External

import { QueryFailedError } from "typeorm";
import type { feedTypes, advertisementFeedTypes, advertisementType } from '../../types';
import type { postType, getPostLikeType } from '../../content-service/types';
import IAwsS3 from "../../../infras/aws/IAwsS3";

class FeedFacade {
    private _log;
    private _googleapis;

    constructor(
        private _feedRepository: IFeedRepository,
        private _postLikeRepository: IPostLikeRepository,
        private _userProfileRepository: IUserProfileRepository,
        private _postRepository: IPostRepository,
        private _postShareRepository: IPostShareRepository,
        private _advertisementRepository: IAdvertisementRepository,
        private _awsS3: IAwsS3,
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

                Promise.allSettled(feedBuilderPromises).then((results) => {

                    const tempTrendingFeedData = {
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

                    const resultsMap = results.map(r => r.status !== 'rejected'? r.value : tempTrendingFeedData);

                    return resolve({
                        message: 'Trending feed successfully retrieved.',
                        data: resultsMap.filter(r => r !== null && r.content.postId !== '' && r.actor.userId !== ''),
                        code: 200
                    });
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
      * Build the ads to be injected in the feed (append ad data, append ad location details, ad media files complete URL, ad like status, and ad user information).
      * @param ad: advertisementFeedTypes
      * @returns Promise<advertisementFeedTypes>
      */
      private _adsforFeedBuilder(ad: advertisementType, loggedInUserId: string = ''): Promise<advertisementFeedTypes> {
        return new Promise(async (resolve, reject) => {
            try {
                const newAd: advertisementFeedTypes = {
                    content: {
                        classification: "ADVERTISEMENT_POST",
                        advertisementId: ad.content.advertisementId,
                        caption: ad.content.caption,
                        googleMapsPlaceId: ad.content.googleMapsPlaceId,
                        locationDetails: ad.content.locationDetails,
                        link: ad.content.link,
                        attachments: ad.content.attachments,
                        originalPost: null,
                        isLiked: false,
                        isSponsored: ad.content.isSponsored,
                        createdAt: ad.content.createdAt,
                        updatedAt: ad.content.updatedAt,
                    },
                    actor: {
                        userId: ad.actor.userId,
                        name: ad.actor.name,
                        avatar: ad.actor.avatar
                    }
                }

                // To provide the complete URL of the post attachments from S3 bucket.
                if (newAd.content.attachments) {
                    for await (const file of newAd.content.attachments) {
                        file.url = `${process.env.AWS_S3_BUCKET_URL}/${file.key}`; // S3 object file URL.

                        // check if the file exists in AWS S3
                        await this._awsS3.headObject({Bucket: `${process.env.AWS_S3_BUCKET}`, Key: file.key}).promise().catch((error: any) => {
                            throw error.code;
                        })
                    }
                }

                // To set the post like status - if the logged-in user liked the post or not.
                if (newAd.content.isLiked === false || newAd.content.isLiked === true) {
                    const getPostLikeByUserIdResult: number | getPostLikeType = await this._postLikeRepository.getByIdAndUserId(newAd.content.advertisementId, loggedInUserId).catch((error) => {
                        throw error;
                    });

                    if (typeof getPostLikeByUserIdResult !== 'number' && getPostLikeByUserIdResult.id) {
                        newAd.content.isLiked = true;
                    }
                }

                // Retrieve original post location details.
                if (newAd.content.googleMapsPlaceId) {
                    const place = await this._googleapis.placeDetails({
                        params: {
                            place_id: newAd.content.googleMapsPlaceId,
                            key: `${process.env.GOOGLE_MAPS_API_KEY}`
                        }
                    }).catch((error) => {
                        throw error.stack;
                    });
                    newAd.content.locationDetails = `${place.data.result.name}, ${place.data.result.vicinity}`;
                }

                return resolve(newAd);
            } catch(error: any) {
                this._log.error({
                    function: '_adsforFeedBuilder()',
                    message: (error.includes('NOT_FOUND') || error.includes('NotFound'))? 'Advertisement not found' : `${error}`,
                    payload: {
                        ad,
                        loggedInUserId
                    }
                });
                return reject(error);
            }
        });
    }

    /**
     * Build the feed (append posts data, append post location details, post media files complete URL, post like status, and post user information).
     * @param feed: feedTypes
     * @returns Promise<feedTypes>
     */
    private async _feedBuilder(feed: feedTypes, loggedInUserId: string = ''): Promise<feedTypes> {
        if (!feed?.content.postId) {
            throw Error;
        }

        if (feed && feed.content.postId) {

            // Retrieve regular post data and append them to each of the respective feed property.
            if (feed.content.classification === 'REGULAR_POST') {
                const post: postType = await this._postRepository.getPostById(feed.content.postId).catch((error) => {
                    throw error;
                });

                if (post.content.attachments) {
                    const attachments = post.content.attachments.map((attachment) => {

                        // check if the file exists in AWS S3
                        return {
                            key: attachment.key,
                            url: '',
                            type: attachment.type,
                            height: '',
                            width: ''
                        }
                    });

                    for await (const file of post.content.attachments) {
                        file.url = `${process.env.AWS_S3_BUCKET_URL}/${file.key}`; // S3 object file URL.
                    }

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

                if (!originalPost.content.postId || !originalPost.actor.userId) {
                    throw Error;
                }

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

                        for await (const file of originalPost.content.attachments) {
                            file.url = `${process.env.AWS_S3_BUCKET_URL}/${file.key}`; // S3 object file URL.
                        }

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
                            for await (const file of feed.content.originalPost.content.attachments) {
                                file.url = `${process.env.AWS_S3_BUCKET_URL}/${file.key}`; // S3 object file URL.
                            }
                        }

                        // Get the user profile data of the original post.
                        if (feed.content.originalPost.actor) {
                            const originalPostUserProfileData = await this._userProfileRepository.getUserProfileBy(feed.content.originalPost.actor.userId, 'user_id').catch((error) => {
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
                for await (const file of feed.content.attachments) {
                    file.url = `${process.env.AWS_S3_BUCKET_URL}/${file.key}`; // S3 object file URL.

                    // check if the file exists in AWS S3
                    await this._awsS3.headObject({Bucket: `${process.env.AWS_S3_BUCKET}`, Key: file.key}).promise().catch((error: any) => {
                        throw error.code;
                    })
                }
            }

            // To set the post like status - if the logged-in user liked the post or not.
            if (feed.content.isLiked === false || feed.content.isLiked === true) {
                const getPostLikeByUserIdResult: number | getPostLikeType = await this._postLikeRepository.getByIdAndUserId(feed.content.postId, loggedInUserId).catch((error) => {
                    throw error;
                });
                if (typeof getPostLikeByUserIdResult !== 'number' && getPostLikeByUserIdResult.id) {
                    feed.content.isLiked = true;
                }
            }

            // Get the user profile data every post in the feed.
            if (feed.actor) {
                const userProfileData = await this._userProfileRepository.getUserProfileBy(feed.actor.userId, 'user_id').catch((error) => {
                    throw error;
                });
                if (!userProfileData.id) {
                    throw Error;
                }
                feed.actor.name = userProfileData.name || '';
                feed.actor.avatar.url = userProfileData.avatar || '';
            }
        }

        return feed;
    }

    /**
     * Get the ads for feed.
     * @param userCognitoSub: string
     * @returns Promise<{
     *         message: string,
     *         data: advertisementFeedTypes[],
     *         code: number
     *     }>
     */
     getAdsforFeed(userCognitoSub: string): Promise<{
        message: string,
        data: advertisementFeedTypes[],
        code: number
    }> {

        return new Promise(async (resolve, reject) => {
            const ads = await this._advertisementRepository.getAllAdvertisements().catch((error: QueryFailedError) => {
                this._log.error({
                    function: 'getAllAdvertisements()',
                    message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                    payload: {}
                });

                return reject({
                    message: Error.DATABASE_ERROR.GET,
                    code: 500
                });
            });

            if (Array.isArray(ads)) {
                const adsforFeedPromises: Promise<advertisementFeedTypes>[] = [];

                ads.forEach((ad) => {
                    if (ad) {
                        adsforFeedPromises.push(this._adsforFeedBuilder(ad, userCognitoSub));
                    }
                });

                Promise.allSettled(adsforFeedPromises).then((results) => {

                    const tempAdData = {
                        content: {
                            classification: '',
                            advertisementId: '',
                            caption: '',
                            googleMapsPlaceId: '',
                            locationDetails: '',
                            link: '',
                            viewCount: 0,
                            attachments: [{
                                key: '',
                                url: '',
                                type: '',
                                height: '',
                                width: ''
                            }],
                            originalPost: null,
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

                    const resultsMap = results.map(r => r.status !== 'rejected'? r.value : tempAdData);

                    return resolve({
                        message: 'Ads successfully retrieved.',
                        data: resultsMap.filter(r => r !== null && r.content.advertisementId !== ''),
                        code: 200
                    });
                });
            } else {
                return reject({
                    message: 'Invalid type for adsforFeed.',
                    code: 500
                });
            }
        });
    }

    /**
     * Get the ads for feed.
     * @param feed: feedTypes[]
     * @param adsFeed: advertisementFeedTypes[]
     * @returns Promise<{
     *         message: string,
     *         data: (feedTypes|advertisementFeedTypes)[],
     *         code: number
     *     }>
     */
    combinePostAndSharedFeedWithAdvertisementFeed(feed: feedTypes[], adsFeed: advertisementFeedTypes[]): Promise<{
        message: string,
        data: (feedTypes|advertisementFeedTypes)[],
        code: number
    }> {

        // insert advertisement for every 5 posts displayed
        // once an ad is injected to the feed, increase the view count by 1 to ensure all ads are displayed as equally as possible
        const newFeed: (feedTypes|advertisementFeedTypes)[] = [];
        const index = 5; // number of posts before inserting an ad

        return new Promise(async (resolve) => {

             if (feed && feed.length > 0 && adsFeed && adsFeed.length > 0) {
                 let postCount = 0;

                 for (let i = 0; i < feed.length; i++) {

                     postCount += 1;
                     newFeed.push(feed[i]);

                     if (postCount === index) {

                         const adIndex = (Math.floor((i)/index));

                         // for cases when advertisements are not enough in numbers
                         if (adsFeed[adIndex] != undefined) {
                             const updateAdViewCountResult = await this._advertisementRepository.updateAdViewCount(adsFeed[adIndex]!.content.advertisementId).catch((error: QueryFailedError) => {
                                 this._log.error({
                                     function: 'arrangeFeed() - updateAdViewCount',
                                     message: `\n error: Database operation error \n details: ${error.message} \n query: ${error.query}`,
                                     payload: {
                                         feed,
                                         adsFeed
                                     }
                                 });
                             });

                             if (updateAdViewCountResult) {
                                 newFeed.push(adsFeed[adIndex]);
                                 postCount = 0;
                             }
                         }
                     }
                 }
             }

             return resolve({
                 message: 'Feed successfully retrieved.',
                 data: newFeed,
                 code: 200
             });
         });
    }
}

export default FeedFacade;