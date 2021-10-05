import express from 'express';
import { Container } from 'typedi';
import 'reflect-metadata';
import appPost from '../app/post/index';
import authMiddleWare from '../middleware/AuthorizationMiddleware';
import { createPostApiValidation } from '../middleware/PostApiValidationMiddleware';

const router = express.Router();
const post = Container.get(appPost.Post);

router.post('/create', [authMiddleWare, ...createPostApiValidation], (req: any, res: any) => post.createPost(req, res));

export default router;