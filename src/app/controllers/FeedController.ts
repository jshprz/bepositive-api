import feedRepository from "../../modules/feed-service/infras/repositories/FeedRepository";
import userRelationshipRepository from "../../modules/user-service/infras/repositories/UserRelationshipRepository"; // External

import feedFacade from "../../modules/feed-service/facades/FeedFacade";
import {Request, Response} from "express";
import { validationResult } from "express-validator";

import ResponseMutator from "../../utils/ResponseMutator";
import type { timestampsType } from '../../modules/types';

import UserProfileRepository from "../../modules/user-service/infras/repositories/UserProfileRepository"; // External
import UserAccountFacade from "../../modules/user-service/facades/UserAccountFacade"; // External
import AwsCognito from "../../modules/user-service/infras/aws/AwsCognito"; // External
import AwsS3 from "../../modules/user-service/infras/aws/AwsS3"; // External
import UserRelationshipRepository from "../../modules/user-service/infras/repositories/UserRelationshipRepository"; // External

class FeedController {

    private _feedFacade;
    private _utilResponseMutator;
    private _userAccountFacade;

    constructor() {
        this._feedFacade = new feedFacade(new feedRepository(), new userRelationshipRepository());
        this._utilResponseMutator = new ResponseMutator();
        this._userAccountFacade = new UserAccountFacade(new AwsCognito(), new AwsS3(), new UserRelationshipRepository(), new UserProfileRepository());
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

            const feed = await this._feedFacade.getFeed(userCognitoSub, pagination);

            for (const f of feed.data) {
                // Get the user profile data every post in the feed.
                const userProfileData = await this._userAccountFacade.getUserProfile(f.userId);
                f.user = userProfileData.data;

                const timestamps = {
                    createdAt: f.createdAt,
                    updatedAt: f.updatedAt
                }

                // Change the createdAt and updatedAt datetime format to unix timestamp
                // We do this as format convention for createdAt and updatedAt
                const unixTimestamps = await this._utilResponseMutator.mutateApiResponseTimestamps<timestampsType>(timestamps);
                f.createdAt = unixTimestamps.createdAt;
                f.updatedAt = unixTimestamps.updatedAt;
            }

            return res.status(feed.code).json({
                message: feed.message,
                payload: feed.data,
                status: feed.code
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
            const pagination = {
                page: Number(req.query.page),
                size: Number(req.query.size)
            };
            const popularityThreshold = 20;
            const trendingFeed = await this._feedFacade.getTrendingFeed(pagination, popularityThreshold);

            // Change the createdAt and updatedAt datetime format to unix timestamp
            // We do this as format convention for createdAt and updatedAt
            for (const f of trendingFeed.data) {

                // Get the user profile data every post in the feed.
                const userProfileData = await this._userAccountFacade.getUserProfile(f.userId);
                f.user = userProfileData.data;

                const timestamps = {
                    createdAt: f.createdAt,
                    updatedAt: f.updatedAt
                }
                const unixTimestamps = this._utilResponseMutator.mutateApiResponseTimestamps<timestampsType>(timestamps);
                f.createdAt = unixTimestamps.createdAt;
                f.updatedAt = unixTimestamps.updatedAt;
            }

            return res.status(trendingFeed.code).json({
                message: trendingFeed.message,
                payload: trendingFeed.data,
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