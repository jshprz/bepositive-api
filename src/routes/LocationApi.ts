import express from 'express';
import { Request, Response } from 'express';
import LocationController from "../app/controllers/LocationController";
import authMiddleWare from '../middleware/AuthorizationMiddleware';

const router = express.Router();
const locationController = new LocationController();

router.get('/place/search/:searchQuery', authMiddleWare, (req: Request, res: Response) => locationController.autocompleteSearch(req, res));

export default router;