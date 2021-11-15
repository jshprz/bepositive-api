import express from 'express';
import { Container } from 'typedi';
import 'reflect-metadata';
import appFeed from '../app/feed/index';
import authMiddleWare from '../middleware/AuthorizationMiddleware';
import { feedApiValidation, trendingFeedApiValidation } from '../middleware/UserFeedApiValidationMiddleware';

const router = express.Router();
const feed = Container.get(appFeed.UserFeed);

router.post('/', [authMiddleWare, ...feedApiValidation], (req: any, res: any) => feed.getFeed(req, res));
router.post('/trending', [authMiddleWare, ...trendingFeedApiValidation], (req: any, res: any) => feed.getTrendingFeed(req, res));

export default router;