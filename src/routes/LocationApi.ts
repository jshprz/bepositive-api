import express from 'express';
import { Request, Response } from 'express';
import { Container } from 'typedi';
import 'reflect-metadata';
import appPlaces from '../app/location/Places';
import authMiddleWare from '../middleware/AuthorizationMiddleware';

const router = express.Router();
const places = Container.get(appPlaces);

router.get('/place/search/:searchQuery', authMiddleWare, (req: Request, res: Response) => places.autocompleteSearch(req, res));

export default router;