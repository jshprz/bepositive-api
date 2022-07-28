import FeedRepository from "../../modules/feed-service/infras/repositories/FeedRepository";
import FeedFacade from "../../modules/feed-service/facades/FeedFacade";

import {Request, Response} from "express";
import { validationResult } from "express-validator";
import Logger from '../../config/Logger';

import ResponseMutator from "../../utils/ResponseMutator";
import type { timestampsType } from '../../modules/types';

import UserProfileRepository from "../../infras/repositories/UserProfileRepository"; // External
import PostLikeRepository from "../../modules/content-service/infras/repositories/PostLikeRepository"; // External
import PostRepository from "../../modules/content-service/infras/repositories/PostRepository"; // External
import PostShareRepository from "../../modules/content-service/infras/repositories/PostShareRepository"; // External

import AdAwsS3 from "../../modules/advertisement-service/infras/aws/AwsS3"; // External
import AdvertisementRepository from "../../modules/advertisement-service/infras/repositories/AdvertisementRepository";
import AdvertisementFacade from "../../modules/advertisement-service/facades/AdvertisementFacade";
import AwsS3 from "../../infras/aws/AwsS3";


class FeedController {

    private _feedFacade;
    private _utilResponseMutator;
    private _advertisementFacade;
    private _log;

    constructor() {
        this._feedFacade = new FeedFacade(
            new FeedRepository(),
            new PostLikeRepository(),
            new UserProfileRepository(),
            new PostRepository(),
            new PostShareRepository(),
            new AdvertisementRepository(),
            new AwsS3()
        );
        this._utilResponseMutator = new ResponseMutator();
        this._advertisementFacade = new AdvertisementFacade(new AdAwsS3(), new AdvertisementRepository(), new PostLikeRepository());
        this._log = Logger.createLogger('FeedController.ts');

    }

    async getFeed(req: Request, res: Response) {
        const errors = validationResult(req).mapped();

        if (errors.page) {
            return res.status(400).json({
                message: errors.page.msg,
                error: 'bad request error',
                status: 400
            });
        }

        if (errors.size) {
            return res.status(400).json({
                message: errors.size.msg,
                error: 'bad request error',
                status: 400
            });
        }

        try {
            const userCognitoSub: string = req.body.userCognitoSub;
            const pagination = {
                page: Number(req.query.page),
                size: Number(req.query.size)
            };

            const getFeedResult = await this._feedFacade.getFeed(userCognitoSub, pagination);
            const adsforFeed= await this._feedFacade.getAdsforFeed(userCognitoSub);

            for (const feed of getFeedResult.data) {

                if (feed) {
                    const timestamps = {
                        createdAt: feed.content.createdAt,
                        updatedAt: feed.content.updatedAt
                    }

                    // Change the createdAt and updatedAt datetime format to unix timestamp
                    // We do this as format convention for createdAt and updatedAt
                    const unixTimestamps = await this._utilResponseMutator.mutateApiResponseTimestamps<timestampsType>(timestamps);
                    feed.content.createdAt = unixTimestamps.createdAt;
                    feed.content.updatedAt = unixTimestamps.updatedAt;

                    if (feed.content.originalPost) {
                        const timestamps = {
                            createdAt: feed.content.originalPost.content.createdAt,
                            updatedAt: feed.content.originalPost.content.updatedAt
                        }

                        // Change the createdAt and updatedAt datetime format to unix timestamp
                        // We do this as format convention for createdAt and updatedAt
                        const unixTimestamps = await this._utilResponseMutator.mutateApiResponseTimestamps<timestampsType>(timestamps);
                        feed.content.originalPost.content.createdAt = unixTimestamps.createdAt;
                        feed.content.originalPost.content.updatedAt = unixTimestamps.updatedAt;
                    }
                }
            }

            for (const ads of adsforFeed.data) {

                if (ads) {
                    const timestamps = {
                        createdAt: ads.content.createdAt,
                        updatedAt: ads.content.updatedAt
                    }

                    // Change the createdAt and updatedAt datetime format to unix timestamp
                    // We do this as format convention for createdAt and updatedAt
                    const unixTimestamps = await this._utilResponseMutator.mutateApiResponseTimestamps<timestampsType>(timestamps);
                    ads.content.createdAt = unixTimestamps.createdAt;
                    ads.content.updatedAt = unixTimestamps.updatedAt;
                }
            }

            const arrangeFeedResult = await this._feedFacade.combinePostAndSharedFeedWithAdvertisementFeed(getFeedResult.data, adsforFeed.data);

            return res.status(getFeedResult.code).json({
                message: getFeedResult.message,
                payload: adsforFeed.data.length > 0 ? arrangeFeedResult.data : getFeedResult.data,
                status: getFeedResult.code
            });

        } catch (error: any) {
            if (error.code && error.code === 500) {
                return res.status(500).json({
                    message: error.message,
                    error: 'Internal server error',
                    status: 500
                });
            } else if (error.code && error.code === 404) {
                return res.status(404).json({
                    message: error.message,
                    error: 'Not found',
                    status: 404
                });
            } else if (error.code && error.code === 400) {
                return res.status(404).json({
                    message: error.message,
                    error: 'Bad request',
                    status: 400
                });
            } else {
                return res.status(520).json({
                    message: error.message,
                    error: 'Unknown server error',
                    status: 520
                });
            }
        }
    }

    async getTrendingFeed(req: Request, res: Response) {
        const errors = validationResult(req).mapped();

        if (errors.page) {
            return res.status(400).json({
                message: errors.page.msg,
                error: 'bad request error',
                status: 400
            });
        }

        if (errors.size) {
            return res.status(400).json({
                message: errors.size.msg,
                error: 'bad request error',
                status: 400
            });
        }

        try {
            const userCognitoSub: string = req.body.userCognitoSub;

            const pagination = {
                page: Number(req.query.page),
                size: Number(req.query.size)
            };

            const popularityThreshold = 1;
            const trendingFeed = await this._feedFacade.getTrendingFeed(pagination, popularityThreshold, userCognitoSub);
            const adsforFeed = await this._feedFacade.getAdsforFeed(userCognitoSub);

            for (const feed of trendingFeed.data) {

                if (feed) {
                    const timestamps = {
                        createdAt: feed.content.createdAt,
                        updatedAt: feed.content.updatedAt
                    }

                    // Change the createdAt and updatedAt datetime format to unix timestamp
                    // We do this as format convention for createdAt and updatedAt
                    const unixTimestamps = await this._utilResponseMutator.mutateApiResponseTimestamps<timestampsType>(timestamps);
                    feed.content.createdAt = unixTimestamps.createdAt;
                    feed.content.updatedAt = unixTimestamps.updatedAt;

                    if (feed.content.originalPost) {
                        const timestamps = {
                            createdAt: feed.content.originalPost.content.createdAt,
                            updatedAt: feed.content.originalPost.content.updatedAt
                        }

                        // Change the createdAt and updatedAt datetime format to unix timestamp
                        // We do this as format convention for createdAt and updatedAt
                        const unixTimestamps = await this._utilResponseMutator.mutateApiResponseTimestamps<timestampsType>(timestamps);
                        feed.content.originalPost.content.createdAt = unixTimestamps.createdAt;
                        feed.content.originalPost.content.updatedAt = unixTimestamps.updatedAt;
                    }
                }
            }

            for (const ads of adsforFeed.data) {

                if (ads) {
                    const timestamps = {
                        createdAt: ads.content.createdAt,
                        updatedAt: ads.content.updatedAt
                    }

                    // Change the createdAt and updatedAt datetime format to unix timestamp
                    // We do this as format convention for createdAt and updatedAt
                    const unixTimestamps = await this._utilResponseMutator.mutateApiResponseTimestamps<timestampsType>(timestamps);
                    ads.content.createdAt = unixTimestamps.createdAt;
                    ads.content.updatedAt = unixTimestamps.updatedAt;
                }
            }

            const arrangeFeedResult = await this._feedFacade.combinePostAndSharedFeedWithAdvertisementFeed(trendingFeed.data, adsforFeed.data);

            return res.status(trendingFeed.code).json({
                message: trendingFeed.message,
                payload: adsforFeed.data.length > 0 ? arrangeFeedResult.data : trendingFeed.data,
                status: trendingFeed.code
            });
        } catch (error: any) {
            if (error.code && error.code === 500) {
                return res.status(500).json({
                    message: error.message,
                    error: 'Internal server error',
                    status: 500
                });
            } else if (error.code && error.code === 404) {
                return res.status(404).json({
                    message: error.message,
                    error: 'Not found',
                    status: 404
                });
            } else if (error.code && error.code === 400) {
                return res.status(404).json({
                    message: error.message,
                    error: 'Bad request',
                    status: 400
                });
            } else {
                return res.status(520).json({
                    message: error.message,
                    error: 'Unknown server error',
                    status: 520
                });
            }
        }
    }
}

export default FeedController;