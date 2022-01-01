import express from 'express';
import UserController from "../app/controllers/UserController";
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

const userController = new UserController();

router.patch('/password/reset', passwordResetApiValidation, (req: any, res: any) => userController.resetPassword(req, res));
router.post('/password/forgot', passwordForgotApiValidation, (req: any, res: any) => userController.forgotPassword(req, res));
router.post('/login', loginApiValidation, (req: any, res: any) => userController.normalLogin(req, res));
router.patch('/register/verify', verifyApiValidation, (req: any, res: any) => userController.verify(req, res));
router.post('/register', registerApiValidation, (req: any, res: any) => userController.register(req, res));
router.delete('/logout', authMiddleWare, (req: any, res: any) => userController.logout(req, res));
router.post('/register/verify/resend', resendAccountConfirmationCodeApiValidation, (req: any, res:any) => userController.resendAccountConfirmationCode(req, res));

export default router;