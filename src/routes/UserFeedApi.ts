import express from 'express';
import FeedController from "../app/controllers/FeedController";
import authMiddleWare from '../middleware/AuthorizationMiddleware';
import { feedApiValidation } from '../middleware/UserFeedApiValidationMiddleware';

const router = express.Router();
const feedController = new FeedController();

router.get('/', [authMiddleWare, ...feedApiValidation], (req: any, res: any) => feedController.getFeed(req, res));
router.get('/trending', [authMiddleWare, ...feedApiValidation], (req: any, res: any) => feedController.getTrendingFeed(req, res));

export default router;