import express from 'express';
import { Request, Response } from 'express';
import { Container } from 'typedi';
import 'reflect-metadata';
import appPost from '../app/post/index';
import authMiddleWare from '../middleware/AuthorizationMiddleware';
import { createPostApiValidation } from '../middleware/PostApiValidationMiddleware';

const router = express.Router();
const post = Container.get(appPost.Post);

router.post('/create', [authMiddleWare, ...createPostApiValidation], (req: Request, res: Response) => post.createPost(req, res));
router.get('/user/posts', authMiddleWare, (req: Request, res: Response) => post.getPostsByUser(req, res));

export default router;