import express from 'express';
import { Container } from 'typedi';
import 'reflect-metadata';
import appUser from '../app/user/index';
import authMiddleWare from '../middleware/AuthorizationMiddleware';

const router = express.Router();
const profile = Container.get(appUser.Profile);

router.get('/profile', authMiddleWare, (req: any, res: any) => profile.getUserProfile(req, res));

export default router;