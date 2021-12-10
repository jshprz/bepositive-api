import { check } from 'express-validator';

export const resendAccountConfirmationCodeApiValidation = [
  check('email').not().isEmpty().withMessage('email property is required.').isEmail().withMessage('email property value is invalid.')
];

export const registerApiValidation = [
    check('email').not().isEmpty().withMessage('email property is required.').isEmail().withMessage('email property value is invalid.'),
    check('name').not().isEmpty().withMessage('name property is required.').isAlpha('en-US', { ignore: ' ' }).withMessage('name property is alpha.').isLength({ max: 32 }).withMessage('name property maximum length is only 32 characters.'),
    check('password').not().isEmpty().withMessage('password property is required.').isLength({ min: 8 }).withMessage('password length atleast 8 characters.').custom((value: string, { req }) => {
      if(value !== req.body.confirmPassword) {
        return Promise.reject('password is not match.');
      }
      return Promise.resolve();
    })
];

export const verifyApiValidation = [
  check('email').not().isEmpty().withMessage('email property is required.').isEmail().withMessage('email property value is invalid.'),
  check('verifyCode').not().isEmpty().withMessage('verifyCode property is required.')
];

export const loginApiValidation = [
  check('email').not().isEmpty().withMessage('email property is required.').isEmail().withMessage('email property value is invalid.'),
  check('password').not().isEmpty().withMessage('password property is required.').isLength({ min: 8 }).withMessage('password length atleast 8 characters.')
];

export const passwordForgotApiValidation = [
  check('email').not().isEmpty().withMessage('email property is required.').isEmail().withMessage('email property value is invalid.'),
];

export const passwordResetApiValidation = [
  check('email').not().isEmpty().withMessage('email property is required.').isEmail().withMessage('email property value is invalid.'),
  check('verifyCode').not().isEmpty().withMessage('verifyCode property is required.'),
  check('newPassword').not().isEmpty().withMessage('newPassword property is required.').isLength({ min: 8 }).withMessage('newPassword length atleast 8 characters.')
];