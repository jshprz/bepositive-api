import express from 'express';
import authMiddleWare from '../middleware/AuthorizationMiddleware';
import SearchController from "../app/controllers/SearchController";
import { searchUserOrHashtagApiValidation } from "../middleware/SearchApiValidationMiddleware";

const router = express.Router();
const searchController = new SearchController();

router.get('/', [authMiddleWare, ...searchUserOrHashtagApiValidation], (req: any, res: any) => searchController.searchUserOrHashtag(req, res));

export default router;