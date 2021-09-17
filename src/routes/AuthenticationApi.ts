import express from 'express';
import { Container } from 'typedi';
import 'reflect-metadata';
import ForgotPassword from '../app/authentication/ForgotPassword';
import Registration from '../app/authentication/Registration';
import Login from '../app/authentication/Login';
import { check, param, validationResult } from 'express-validator';

const router = express.Router();

const forgotPassword = Container.get(ForgotPassword);
const registration = Container.get(Registration);
const login = Container.get(Login);

router.post('/login', [
  check('emailOrUsername').not().isEmpty().withMessage('emailOrUsername property is required.'),
  check('password').not().isEmpty().withMessage('password property is required.').isLength({ min: 8 }).withMessage('password length atleast 6 character.')
], (req: any, res: any) => login.normalLogin(req, res));

router.post('/register', [
  check('username').not().isEmpty().withMessage('username property is required.'),
  check('email').not().isEmpty().withMessage('email property is required.').isEmail().withMessage('email property value is invalid.'),
  check('name').not().isEmpty().withMessage('name property is required.').isAlpha('en-US', { ignore: ' ' }).isLength({ max: 32 }),
  check('password').not().isEmpty().withMessage('password property is required.').isLength({ min: 8 }).withMessage('password length atleast 6 character.').custom((value: string, { req }) => {
    if(value !== req.body.confirmPassword) {
      return Promise.reject('password is not match.');
    }
    return Promise.resolve();
  })
], (req: any, res: any) => registration.register(req, res));

router.post('/verify', [
  check('username').not().isEmpty().withMessage('username property is required.'),
  check('verifyCode').not().isEmpty().withMessage('verifyCode property is required.')
], (req: any, res: any) => registration.verify(req, res));

router.post('/register', [
  check('username').not().isEmpty().withMessage('username property is required.'),
  check('email').not().isEmpty().withMessage('email property is required.').isEmail().withMessage('email property value is invalid.'),
  check('name').not().isEmpty().withMessage('name property is required.').isAlpha('en-US', { ignore: ' ' }).isLength({ max: 32 }),
  check('password').not().isEmpty().withMessage('password property is required.').isLength({ min: 8 }).withMessage('password length atleast 6 character.').custom((value: string, { req }) => {
    if(value !== req.body.confirmPassword) {
      return Promise.reject('password is not match.');
    }
    return Promise.resolve();
  })
], (req: any, res: any) => registration.register(req, res));

router.post('/verify', [
  check('username').not().isEmpty().withMessage('username property is required.'),
  check('verifyCode').not().isEmpty().withMessage('verifyCode property is required.')
], (req: any, res: any) => registration.verify(req, res));

/**
 * @openapi
 * /:
 *  post:
 *    description: creates a reset password token and its expiration then sends it via email.
 *    operation: requestResetPasswordViaEmail
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *          properties:
 *            email:
 *              type: string
 *    responses:
 *      200:
 *        description: request reset password via email successful response
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              items:
 *                message: Reset password token successfully sent to the email.
 *                payload: {}
 *                status: 200
 *      400:
 *        description: bad request error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              items:
 *                message: email property is required
 *                error: bad request error
 *                status: 400
 *      404:
 *        description: resource not found
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              items:
 *                message: email provided does not exist
 *                error: resource not found
 *                status: 404
 *      500:
 *        description: internal server error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              items:
 *                message: internal server error
 *                error: internal server error
 *                status: 500
 *
 */
router.post('/password/email', [
  check('email').not().isEmpty().withMessage('email property is required.').isEmail().withMessage('email property value is invalid.')
], (req: any, res: any) => forgotPassword.requestResetPasswordViaEmail(req, res));


/**
 * @openapi
 * /:
 *  get:
 *    description: verifies the validity of the token.
 *    operation: verifyResetToken
 *    parameters:
 *      schema:
 *        type: string
 *    - name: token
 *      in: path
 *      required: true
 *    responses:
 *      200:
 *        description: reset token validity confirmation.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              items:
 *                message: reset token is valid.
 *                payload: {
 *                  token:
 *                    type: string
 *                }
 *                status: 200
 *      400:
 *        description: bad request error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              items:
 *                token:
 *                  message: token parameter is required
 *                  error: bad request error
 *                  status: 400
 *      403:
 *        description: forbidden client error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              items:
 *                message: reset password token is not valid
 *                error: forbidden client error
 *                status: 403
 *      500:
 *        description: internal server error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              items:
 *                message: internal server error
 *                error: internal server error
 *                status: 500
 *
 */
router.get('/password/verify/:token', [
  param('token').not().isEmpty().withMessage('token parameter is required.')
], (req: any, res: any) => forgotPassword.verifyResetToken(req, res));


/**
 * @openapi
 * /:
 *  patch:
 *    description: resets the user password.
 *    operation: resetPassword
 *    parameters:
 *      schema:
 *        type: string
 *    - name: token
 *      in: path
 *      required: true
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *          properties:
 *            password:
 *              type: string
 *            confirmPassword:
 *              type: string
 *    responses:
 *      200:
 *        description: password reset successful response.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              items:
 *                message: password reset successfully.
 *                payload: {}
 *                status: 200
 *      400:
 *        description: bad request error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              items:
 *                token:
 *                  message: token parameter is required
 *                  error: bad request error
 *                  status: 400
 *                password:
 *                  message: password property is required. | password length atleast 6 character. | password is not match.
 *                  error: bad request error
 *                  status: 400
 *      403:
 *        description: forbidden client error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              items:
 *                message: reset password token is not valid.
 *                error: forbidden client error
 *                status: 403
 *      500:
 *        description: internal server error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              items:
 *                message: internal server error
 *                error: internal server error
 *                status: 500
 *
 */
router.patch('/password/reset/:token', [
  param('token').not().isEmpty().withMessage('token parameter is required.'),
  check('password').not().isEmpty().withMessage('password property is required.').isLength({ min: 6 }).withMessage('password length atleast 6 character.').custom((value: string, { req }) => {
    if(value !== req.body.confirmPassword) {
      return Promise.reject('password is not match.');
    }
    return Promise.resolve();
  })
], (req: any, res: any) => forgotPassword.resetPassword(req, res));

export default router;