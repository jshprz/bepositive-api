import express from 'express';
import { Request, Response } from 'express';
import AdvertisementController from "../app/controllers/AdvertisementController";
import authMiddleWare from '../middleware/AuthorizationMiddleware';
import {
  createAdApiValidation,
  getAdByIdApiValidation,
  updateAdApiValidation,
  removeAdApiValidation,
  updateAdViewCountApiValidation,
  likeOrUnlikeAdvertisementApiValidation,
  flagAdvertisementApiValidation,
  uploadAdAvatarApiValidation,
} from '../middleware/AdvertisementApiValidationMiddleware';

const router = express.Router();
const advertisementController = new AdvertisementController();

router.post('/create', [authMiddleWare, ...createAdApiValidation], (req: Request, res: Response) => advertisementController.createAdvertisement(req, res));
router.get('/get/advertisements', authMiddleWare, (req: Request, res: Response) => advertisementController.getAllAdvertisements(req, res));
router.get('/get/:id', [authMiddleWare, ...getAdByIdApiValidation], (req: Request, res: Response) => advertisementController.getAdvertisementById(req, res));
router.patch('/update/:id', [authMiddleWare, ...updateAdApiValidation], (req: Request, res: Response) => advertisementController.updateAdvertisement(req, res));
router.patch('/remove/:id', [authMiddleWare, ...removeAdApiValidation], (req: Request, res: Response) => advertisementController.removeAdvertisement(req, res));
router.patch('/update/view-count/:id', [authMiddleWare, ...updateAdViewCountApiValidation], (req: Request, res: Response) => advertisementController.updateAdViewCount(req, res));
router.post('/like', [authMiddleWare, ...likeOrUnlikeAdvertisementApiValidation], (req: Request, res: Response) => advertisementController.likeOrUnlikeAdvertisement(req, res));
router.patch('/flag/:id', [authMiddleWare, ...flagAdvertisementApiValidation], (req: Request, res: Response) => advertisementController.flagAdvertisement(req, res));
router.post('/avatar/upload', [authMiddleWare, ...uploadAdAvatarApiValidation], (req: any, res: any) => advertisementController.uploadAdvertisementAvatar(req, res));

export default router;
