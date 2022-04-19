import express from 'express';
import { Request, Response } from 'express';
import CommentController from "../app/controllers/CommentController";
import authMiddleWare from '../middleware/AuthorizationMiddleware';
import { addCommentApiValidation, getCommentsApiValidation, updateCommentApiValidation, removeCommentApiValidation, likeOrUnlikeCommentApiValidation } from '../middleware/CommentApiValidationMiddleware';

const router = express.Router();
const commentController = new CommentController();

router.post('/add', [authMiddleWare, ...addCommentApiValidation], (req: Request, res: Response) => commentController.addComment(req, res));
router.get('/get/comments/:postId', [authMiddleWare, ...getCommentsApiValidation], (req: Request, res: Response) => commentController.getCommentsByPostId(req, res));
router.patch('/update/:id', [authMiddleWare, ...updateCommentApiValidation], (req: Request, res: Response) => commentController.updateComment(req, res));
router.patch('/remove/:id', [authMiddleWare, ...removeCommentApiValidation], (req: Request, res: Response) => commentController.removeComment(req, res));
router.post('/like', [authMiddleWare, ...likeOrUnlikeCommentApiValidation], (req: Request, res: Response) => commentController.likeOrUnlikeComment(req, res));

export default router;