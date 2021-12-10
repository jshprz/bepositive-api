import express from 'express';
import { Container } from 'typedi';
import 'reflect-metadata';
import appAuthentication from '../app/authentication/index';
import {
  registerApiValidation,
  verifyApiValidation,
  loginApiValidation,
  passwordForgotApiValidation,
  passwordResetApiValidation,
  resendAccountConfirmationCodeApiValidation
} from '../middleware/AuthenticationApiValidationMiddleware';
import authMiddleWare from '../middleware/AuthorizationMiddleware';

const router = express.Router();

const login = Container.get(appAuthentication.Login);
const password = Container.get(appAuthentication.Password);
const registration = Container.get(appAuthentication.Registration);

router.patch('/password/reset', passwordResetApiValidation, (req: any, res: any) => password.resetPassword(req, res));
router.post('/password/forgot', passwordForgotApiValidation, (req: any, res: any) => password.forgotPassword(req, res));
router.post('/login', loginApiValidation, (req: any, res: any) => login.normalLogin(req, res));
router.patch('/register/verify', verifyApiValidation, (req: any, res: any) => registration.verify(req, res));
router.post('/register', registerApiValidation, (req: any, res: any) => registration.register(req, res));
router.delete('/logout', authMiddleWare, (req: any, res: any) => login.logout(req, res));
router.post('/register/verify/resend', resendAccountConfirmationCodeApiValidation, (req: any, res:any) => registration.resendAccountConfirmationCode(req, res));

export default router;