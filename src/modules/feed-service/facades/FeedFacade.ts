import IFeedRepository from "../infras/repositories/IFeedRepository";
import Logger from '../../../config/Logger';
import Error from "../../../config/Error";
import { Client } from '@googlemaps/google-maps-services-js';

import IUserRelationshipRepository from "../../user-service/infras/repositories/IUserRelationshipRepository"; // External
import UserAccountFacade from "../../user-service/facades/UserAccountFacade"; // External
import awsCognito from "../../user-service/infras/aws/AwsCognito"; // External
import userRelationshipRepository from "../../user-service/infras/repositories/UserRelationshipRepository"; // External

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
     * @param followings: string[]
     * @returns Promise<any[]>
     */
    getFeed(userCognitoSub: string, pagination: {page: number, size: number}, followings: string[]): Promise<any[]> {

        return new Promise(async (resolve, reject) => {
            const rawFollowings = await this._userRelationshipRepository.get(true, userCognitoSub).catch((error) => {
                this._log.error({
                    message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                    payload: {
                        userCognitoSub,
                        pagination,
                        followings
                    }
                });

                return reject(Error.DATABASE_ERROR.GET);
            });

            const followings: string[] = [userCognitoSub]; // the current logged in user should also see their posts on their newsfeed

            // If the rawFollowings is not an array, it should be an error.
            if (Array.isArray(rawFollowings)) {
                rawFollowings.map((following) => {
                    followings.push(following.user_relationships_user_id);
                });
            } else {
                this._log.error({
                    function: 'getFeed()',
                    message: `An error occurred while retrieving the rawFollowings: ${rawFollowings}`,
                    payload: {userCognitoSub, pagination, followings}
                });

                return reject({
                    message: 'An error occurred while retrieving the rawFollowings',
                    code: 500
                });
            }

            const feed = await this._feedRepository.getFeed(pagination, followings).catch((error) => {
                this._log.error({
                    message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                    payload: {
                        userCognitoSub,
                        pagination,
                        followings
                    }
                });

                return reject(Error.DATABASE_ERROR.GET);
            });

            const feedHolder: any[] = [];

            for (let i = 0; i < feed.length; i++) {
                const feedBuilder = await this._feedBuilder(feed[i]).catch((error) => {
                    feed.splice(i, 1);
                });
                feedHolder.push(feedBuilder);
            }

            return resolve(feedHolder);
        });
    }

    /**
     * Get the trending feed/s.
     * @param pagination: {page: number, size: number}
     * @param popularityThreshold: number
     * @returns Promise<any[]>
     */
    getTrendingFeed(pagination: {page: number, size: number}, popularityThreshold: number): Promise<any[]> {
        return new Promise(async (resolve, reject) => {
            const feed = await this._feedRepository.getTrendingFeed(pagination, popularityThreshold).catch((error) => {
                this._log.error({
                    message: `\n error: Database operation error \n details: ${error.detail || error.message} \n query: ${error.query}`,
                    payload: {
                        pagination,
                        popularityThreshold
                    }
                });

                return reject(Error.DATABASE_ERROR.GET);
            });

            const feedHolder: any[] = [];

            for (let i = 0; i < feed.length; i++) {
                const feedBuilder = await this._feedBuilder(feed[i]).catch(() => {
                    feed.splice(i, 1);
                });
                feedHolder.push(feedBuilder);
            }

            return resolve(feedHolder);
        });
    }

    /**
     * Build the feed/s location and user involvement.
     * @param feed: any
     * @returns Promise<any>
     */
    private _feedBuilder(feed: any): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                feed.location_details = '';
                if (feed.google_maps_place_id) {
                    // Retrieve post location details
                    const place = await this._googleapis.placeDetails({
                        params: {
                            place_id: feed.google_maps_place_id,
                            key: `${process.env.GOOGLE_MAPS_API_KEY}`
                        }
                    }).catch((error) => {
                        throw error.stack;
                    });
                    feed.location_details = `${place.data.result.name}, ${place.data.result.vicinity}`;
                }
                feed.user = await this._userAccountFacade.getUser(feed.user_id);

                return resolve(feed)
            } catch(e) {
                return reject(false);
            }
        });
    }
}

export default FeedFacade;