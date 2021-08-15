import express from 'express';
import { Container } from 'typedi';
import 'reflect-metadata';
import Account from '../app/user/Account';

const router = express.Router();

const account = Container.get(Account);

router.post('/registration', (req, res) => account.registerUser(req, res));
router.post('/update-user', (req, res) => account.updateUser(req, res));

export default router;