import express from 'express';
import { Request, Response } from 'express';
import ContentController from "../app/controllers/ContentController";
import authMiddleWare from '../middleware/AuthorizationMiddleware';
import {
  createPostApiValidation,
  getPostByIdApiValidation,
  updatePostApiValidation,
  removePostApiValidation,
  sharePostByIdApiValidation,
  getSharedPostByIdApiValidation,
  likeOrUnlikePostApiValidation,
  flagPostApiValidation,
  updateSharedPost,
  getPostsByHashtagApiValidation
} from '../middleware/PostApiValidationMiddleware';

const router = express.Router();
const contentController = new ContentController();

router.post('/create', [authMiddleWare, ...createPostApiValidation], (req: Request, res: Response) => contentController.createPost(req, res));
router.get('/user/posts/:userId?', authMiddleWare, (req: Request, res: Response) => contentController.getPostsByUser(req, res));
router.get('/user/favorites/:userId?', authMiddleWare, (req: Request, res: Response) => contentController.getFavoritePostsByUser(req, res));
router.get('/get/:id', [authMiddleWare, ...getPostByIdApiValidation], (req: Request, res: Response) => contentController.getPostById(req, res));
router.patch('/update/:id', [authMiddleWare, ...updatePostApiValidation], (req: Request, res: Response) => contentController.updatePost(req, res));
router.patch('/remove/:id', [authMiddleWare, ...removePostApiValidation], (req: Request, res: Response) => contentController.removePost(req, res));
router.post('/share/:id', [authMiddleWare, ...sharePostByIdApiValidation], (req: Request, res: Response) => contentController.sharePostById(req, res));
router.get('/share/get/:id', [authMiddleWare, ...getSharedPostByIdApiValidation], (req: Request, res: Response) => contentController.getSharedPostById(req, res));
router.patch('/share/update/:id', [authMiddleWare, ...updateSharedPost], (req: Request, res: Response) => contentController.updateSharedPost(req, res));
router.post('/like', [authMiddleWare, ...likeOrUnlikePostApiValidation], (req: Request, res: Response) => contentController.likeOrUnlikePost(req, res));
router.patch('/flag/:id', [authMiddleWare, ...flagPostApiValidation], (req: Request, res: Response) => contentController.flagPost(req, res));
router.get('/hashtag/posts/:hashtagId?', [authMiddleWare, ...getPostsByHashtagApiValidation], (req: Request, res: Response) => contentController.getPostsByHashtag(req, res));

export default router;