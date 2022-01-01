import express from 'express';
import UserController from "../app/controllers/UserController";
import authMiddleWare from '../middleware/AuthorizationMiddleware';

const router = express.Router();
const userController = new UserController();

router.get('/profile', authMiddleWare, (req: any, res: any) => userController.getUserProfile(req, res));

export default router;