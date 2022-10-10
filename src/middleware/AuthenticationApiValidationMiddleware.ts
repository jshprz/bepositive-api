import { check } from 'express-validator';

export const refreshAccessTokenApiValidation = [
    check('accessToken').not().isEmpty().withMessage('accessToken property is required.').isString().withMessage('accessToken should be a type of string.'),
    check('refreshToken').not().isEmpty().withMessage('refreshToken property is required.').isString().withMessage('refreshToken should be a type of string.')
];

export const resendAccountConfirmationCodeApiValidation = [
  check('email').not().isEmpty().withMessage('email property is required.').isEmail().withMessage('email property should be a valid email.')
];

export const registerApiValidation = [
    check('username').not().isEmpty().withMessage('username property is required.').isLength({ max: 32 }).withMessage('username should not exceed 32 characters.'),
    check('email').not().isEmpty().withMessage('email property is required.').isEmail().withMessage('email property should be a valid email.'),
    check('phoneNumber').not().isEmpty().withMessage('phone number property is required.').isMobilePhone(['en-PH', 'en-AU']).withMessage('phone number property only accepts PH or AU phone numbers'),
    check('name').not().isEmpty().withMessage('name property is required.').isAlpha('en-US', { ignore: ' ' }).withMessage('name property is alpha.').isLength({ max: 32 }).withMessage('name property maximum length is only 32 characters.'),
    check('password').not().isEmpty().withMessage('password property is required.').isLength({ min: 8 }).withMessage('password length atleast 8 characters.').custom((value: string, { req }) => {
      if(value !== req.body.confirmPassword) {
        return Promise.reject('password is not match.');
      }
      return Promise.resolve();
    })
];

export const verifyApiValidation = [
    check('email').not().isEmpty().withMessage('email property is required.').isEmail().withMessage('email property should be a valid email.'),
    check('verifyCode').not().isEmpty().withMessage('verifyCode property is required.')
];

export const loginApiValidation = [
    check('user').not().isEmpty().withMessage('user property is required.'),
    check('password').not().isEmpty().withMessage('password property is required.').isLength({ min: 8 }).withMessage('password length atleast 8 characters.')
];

export const adminLoginApiValidation = [
    check('user').not().isEmpty().withMessage('email property is required.').isEmail().withMessage('email property should be a valid email.'),
    check('password').not().isEmpty().withMessage('password property is required.').isLength({ min: 8 }).withMessage('password length atleast 8 characters.')
];

export const passwordForgotApiValidation = [
  check('email').not().isEmpty().withMessage('email property is required.').isEmail().withMessage('email property should be a valid email.'),
];

export const passwordResetApiValidation = [
  check('email').not().isEmpty().withMessage('email property is required.').isEmail().withMessage('email property should be a valid email.'),
  check('verifyCode').not().isEmpty().withMessage('verifyCode property is required.'),
  check('newPassword').not().isEmpty().withMessage('newPassword property is required.').isLength({ min: 8 }).withMessage('newPassword length atleast 8 characters.')
];