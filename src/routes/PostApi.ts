import express from 'express';
import { Request, Response } from 'express';
import ContentController from "../app/controllers/ContentController";
import authMiddleWare from '../middleware/AuthorizationMiddleware';
import { createPostApiValidation, getPostByIdApiValidation, updatePostApiValidation, removePostApiValidation } from '../middleware/PostApiValidationMiddleware';

const router = express.Router();
const contentController = new ContentController();

router.post('/create', [authMiddleWare, ...createPostApiValidation], (req: Request, res: Response) => contentController.createPost(req, res));
router.get('/user/posts', authMiddleWare, (req: Request, res: Response) => contentController.getPostsByUser(req, res));
router.get('/get/:id', [authMiddleWare, ...getPostByIdApiValidation], (req: Request, res: Response) => contentController.getPostById(req, res));
router.patch('/update/:id', [authMiddleWare, ...updatePostApiValidation], (req: Request, res: Response) => contentController.updatePost(req, res));
router.patch('/remove/:id', [authMiddleWare, ...removePostApiValidation], (req: Request, res: Response) => contentController.removePost(req, res));

export default router;