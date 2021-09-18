import express from 'express';
import { Container } from 'typedi';
import 'reflect-metadata';
import { check } from 'express-validator';
import appAuthentication from '../app/authentication/index';

const router = express.Router();

const login = Container.get(appAuthentication.Login);
const password = Container.get(appAuthentication.Password);
const registration = Container.get(appAuthentication.Registration);

router.patch('/password/reset', [
  check('emailOrUsername').not().isEmpty().withMessage('emailOrUsername property is required.'),
  check('verifyCode').not().isEmpty().withMessage('verifyCode property is required.'),
  check('newPassword').not().isEmpty().withMessage('newPassword property is required.').isLength({ min: 8 }).withMessage('newPassword length atleast 8 characters.')
], (req: any, res: any) => password.resetPassword(req, res));

router.post('/password/forgot', [
  check('emailOrUsername').not().isEmpty().withMessage('emailOrUsername property is required.'),
], (req: any, res: any) => password.forgotPassword(req, res));

router.post('/login', [
  check('emailOrUsername').not().isEmpty().withMessage('emailOrUsername property is required.'),
  check('password').not().isEmpty().withMessage('password property is required.').isLength({ min: 8 }).withMessage('password length atleast 8 characters.')
], (req: any, res: any) => login.normalLogin(req, res));


router.patch('/register/verify', [
  check('username').not().isEmpty().withMessage('username property is required.'),
  check('verifyCode').not().isEmpty().withMessage('verifyCode property is required.')
], (req: any, res: any) => registration.verify(req, res));

router.post('/register', [
  check('username').not().isEmpty().withMessage('username property is required.'),
  check('email').not().isEmpty().withMessage('email property is required.').isEmail().withMessage('email property value is invalid.'),
  check('name').not().isEmpty().withMessage('name property is required.').isAlpha('en-US', { ignore: ' ' }).withMessage('name property is alpha.').isLength({ max: 32 }).withMessage('name property maximum length is only 32 characters.'),
  check('password').not().isEmpty().withMessage('password property is required.').isLength({ min: 8 }).withMessage('password length atleast 8 characters.').custom((value: string, { req }) => {
    if(value !== req.body.confirmPassword) {
      return Promise.reject('password is not match.');
    }
    return Promise.resolve();
  })
], (req: any, res: any) => registration.register(req, res));

export default router;