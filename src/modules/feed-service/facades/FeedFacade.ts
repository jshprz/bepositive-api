import IFeedRepository from "../infras/repositories/IFeedRepository";
import Logger from '../../../config/Logger';
import Error from "../../../config/Error";
import { Client } from '@googlemaps/google-maps-services-js';

import IUserRelationshipRepository from "../../user-service/infras/repositories/IUserRelationshipRepository"; // External
import UserAccountFacade from "../../user-service/facades/UserAccountFacade"; // External
import awsCognito from "../../user-service/infras/aws/AwsCognito"; // External
import userRelationshipRepository from "../../user-service/infras/repositories/UserRelationshipRepository"; // External

import { QueryFailedError } from "typeorm";

type feedTypes = {
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
    user: {}
};

class FeedFacade {
    private _log;
    private _googleapis;
    private _userAccountFacade;

    constructor(private _feedRepository: IFeedRepository, private _userRelationshipRepository: IUserRelationshipRepository) {
        this._log = Logger.createLogger('FeedFacade.ts');
        this._googleapis = new Client({});
        this._userAccountFacade = new UserAccountFacade(new awsCognito(), new userRelationshipRepository());
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
                    feedBuilderPromises.push(this._feedBuilder(feed));
                });

                const newFeedCollection = await Promise.all(feedBuilderPromises)
                    .catch((error: string) => {
                        this._log.error({
                            function: 'getFeed()',
                            message: error.toString(),
                            payload: {
                                userCognitoSub,
                                pagination
                            }
                        });

                        return reject({
                            message: 'Error occured while generating a feed.',
                            code: 500
                        });
                    });

                return resolve({
                    message: 'Feed successfully retrieved.',
                    data: (Array.isArray(newFeedCollection))? newFeedCollection : [],
                    code: 200
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
     * @returns Promise<{
     *         message: string,
     *         data: feedTypes[],
     *         code: number
     *     }>
     */
    getTrendingFeed(pagination: {page: number, size: number}, popularityThreshold: number): Promise<{
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
                    feedBuilderPromises.push(this._feedBuilder(trendingFeed));
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
     * Build the feed/s location and user involvement.
     * @param feed: feedTypes
     * @returns Promise<feedTypes>
     */
    private _feedBuilder(feed: feedTypes): Promise<feedTypes> {
        return new Promise(async (resolve, reject) => {
            try {
                if (feed.googleMapsPlaceId) {
                    // Retrieve post location details
                    const place = await this._googleapis.placeDetails({
                        params: {
                            place_id: feed.googleMapsPlaceId,
                            key: `${process.env.GOOGLE_MAPS_API_KEY}`
                        }
                    }).catch((error) => {
                        throw error.stack;
                    });
                    feed.locationDetails = `${place.data.result.name}, ${place.data.result.vicinity}`;
                }
                if (feed.postMediaFiles) {
                    feed.postMediaFiles.forEach((file) => {
                        file.key = `${process.env.AWS_S3_BUCKET_URL}/${file.key}`; // S3 object file URL.
                    });
                }

                feed.user = await this._userAccountFacade.getUser(feed.userId).catch((error) => {
                    throw error;
                });
                return resolve(feed)
            } catch(e) {
                return reject(false);
            }
        });
    }
}

export default FeedFacade;