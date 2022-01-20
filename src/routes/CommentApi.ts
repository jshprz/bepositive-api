import express from 'express';
import { Request, Response } from 'express';
import CommentController from "../app/controllers/CommentController";
import authMiddleWare from '../middleware/AuthorizationMiddleware';
import { addCommentApiValidation, updateCommentApiValidation } from '../middleware/CommentApiValidationMiddleware';

const router = express.Router();
const commentController = new CommentController();

router.post('/add', [authMiddleWare, ...addCommentApiValidation], (req: Request, res: Response) => commentController.addComment(req, res));
router.patch('/update/:id', [authMiddleWare, ...updateCommentApiValidation], (req: Request, res: Response) => commentController.updateComment(req, res));

export default router;