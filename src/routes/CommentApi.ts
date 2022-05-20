import express from 'express';
import { Request, Response } from 'express';
import CommentController from "../app/controllers/CommentController";
import authMiddleWare from '../middleware/AuthorizationMiddleware';
import { addCommentApiValidation, getCommentsApiValidation, replyToCommentApiValidation, updateCommentOrReplyApiValidation, removeCommentOrReplyApiValidation, likeOrUnlikeCommentOrReplyApiValidation } from '../middleware/CommentApiValidationMiddleware';

const router = express.Router();
const commentController = new CommentController();

router.post('/add', [authMiddleWare, ...addCommentApiValidation], (req: Request, res: Response) => commentController.addComment(req, res));
router.get('/get/comments/:postId', [authMiddleWare, ...getCommentsApiValidation], (req: Request, res: Response) => commentController.getCommentsByPostId(req, res));
router.patch('/update/:id', [authMiddleWare, ...updateCommentOrReplyApiValidation], (req: Request, res: Response) => commentController.updateCommentOrReply(req, res));
router.patch('/remove/:id', [authMiddleWare, ...removeCommentOrReplyApiValidation], (req: Request, res: Response) => commentController.removeCommentOrReply(req, res));
router.post('/like', [authMiddleWare, ...likeOrUnlikeCommentOrReplyApiValidation], (req: Request, res: Response) => commentController.likeOrUnlikeCommentOrReply(req, res));
router.post('/reply/:commentId', [authMiddleWare, ...replyToCommentApiValidation], (req: Request, res: Response) => commentController.replyToComment(req, res));

export default router;