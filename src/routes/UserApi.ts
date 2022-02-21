import express from 'express';
import UserController from "../app/controllers/UserController";
import authMiddleWare from '../middleware/AuthorizationMiddleware';
import { followUserApiValidation } from '../middleware/UserApiValidationMiddleware';

const router = express.Router();
const userController = new UserController();

router.get('/profile', authMiddleWare, (req: any, res: any) => userController.getUserProfile(req, res));
router.post('/follow/:followeeCognitoSub', [authMiddleWare, ...followUserApiValidation], (req: any, res: any) => userController.followUser(req, res));
router.patch('/unfollow/:followeeCognitoSub', [authMiddleWare, ...followUserApiValidation], (req: any, res: any) => userController.unfollowUser(req, res));
export default router;