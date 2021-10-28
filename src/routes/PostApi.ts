import express from 'express';
import { Request, Response } from 'express';
import { Container } from 'typedi';
import 'reflect-metadata';
import appPost from '../app/post/index';
import authMiddleWare from '../middleware/AuthorizationMiddleware';
import { createPostApiValidation, getPostByIdApiValidation, updatePostApiValidation, removePostApiValidation } from '../middleware/PostApiValidationMiddleware';

const router = express.Router();
const post = Container.get(appPost.Post);

router.post('/create', [authMiddleWare, ...createPostApiValidation], (req: Request, res: Response) => post.createPost(req, res));
router.get('/user/posts', authMiddleWare, (req: Request, res: Response) => post.getPostsByUser(req, res));
router.get('/get/:id', [authMiddleWare, ...getPostByIdApiValidation], (req: Request, res: Response) => post.getPostById(req, res));
router.patch('/update/:id', [authMiddleWare, ...updatePostApiValidation], (req: Request, res: Response) => post.updatePost(req, res));
router.patch('/remove/:id', [authMiddleWare, ...removePostApiValidation], (req: Request, res: Response) => post.removePost(req, res));

export default router;