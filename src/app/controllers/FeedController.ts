import feedRepository from "../../modules/feed-service/infras/repositories/FeedRepository";
import userRelationshipRepository from "../../modules/user-service/infras/repositories/UserRelationshipRepository"; // External

import feedFacade from "../../modules/feed-service/facades/FeedFacade";
import {Request, Response} from "express";
import { validationResult } from "express-validator";

// Declaration merging on express-session
import '../../declarations/DExpressSession';

class FeedController {

    private _feedFacade;

    constructor() {
        this._feedFacade = new feedFacade(new feedRepository(), new userRelationshipRepository());
    }

    async getFeed(req: Request, res: Response) {
        const errors = validationResult(req).mapped();

        if (errors.pagination) {
            return res.status(400).json({
                message: errors.pagination.msg,
                error: 'bad request error',
                status: 400
            });
        }

        if (!req.session.user) {
            return res.status(401).json({
                message: 'Please login and try again.',
                error: 'Unauthenticated',
                status: 401
            });
        }

        try {
            const userCognitoSub: string = req.session.user.sub;
            const { pagination } = req.body;
            const followings: string[] = [];

            const feed = await this._feedFacade.getFeed(userCognitoSub, pagination, followings);

            return res.status(200).json({
                message: 'Posts retrieved successfully',
                payload: feed,
                status: 200
            });
        } catch (error: any) {
            res.status(500).json({
                message: 'An error occurred in retrieving posts',
                error: 'Internal server error',
                status: 500
            });
        }
    }

    async getTrendingFeed(req: Request, res: Response) {
        const errors = validationResult(req).mapped();

        if (errors.pagination) {
            return res.status(400).json({
                message: errors.pagination.msg,
                error: 'bad request error',
                status: 400
            });
        }

        if (!req.session.user) {
            return res.status(401).json({
                message: 'Please login and try again.',
                error: 'Unauthenticated',
                status: 401
            });
        }

        try {
            const { pagination } = req.body;
            const popularityThreshold = 20;
            const feed = await this._feedFacade.getTrendingFeed(pagination, popularityThreshold);

            return res.status(200).json({
                message: 'Posts retrieved successfully',
                payload: feed,
                status: 200
            });
        } catch (error: any) {
            res.status(500).json({
                message: 'An error occurred in retrieving posts',
                error: 'Internal server error',
                status: 500
            });
        }
    }
}

export default FeedController;