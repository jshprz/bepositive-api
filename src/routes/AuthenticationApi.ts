import express from 'express';
import { Container } from 'typedi';
import 'reflect-metadata';

const router = express.Router();

router.post('/login', (req, res) => {});
router.post('/password/email', (req, res) => {});
router.post('/password/reset/:token', (req, res) => {});

export default router;