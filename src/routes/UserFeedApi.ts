import express from 'express';
import FeedController from "../app/controllers/FeedController";
import authMiddleWare from '../middleware/AuthorizationMiddleware';
import { feedApiValidation, trendingFeedApiValidation } from '../middleware/UserFeedApiValidationMiddleware';

const router = express.Router();
const feedController = new FeedController();

router.post('/', [authMiddleWare, ...feedApiValidation], (req: any, res: any) => feedController.getFeed(req, res));
router.post('/trending', [authMiddleWare, ...trendingFeedApiValidation], (req: any, res: any) => feedController.getTrendingFeed(req, res));

export default router;