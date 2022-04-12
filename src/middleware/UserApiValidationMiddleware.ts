import { check } from "express-validator";

export const followUserApiValidation = [
    check('followeeCognitoSub').not().isEmpty().withMessage('followeeCognitoSub parameter is required.').isString().withMessage('followeeCognitoSub should be a type of string.')
];

export const updatePrivacyApiValidation = [
    check('isPublic').not().isEmpty().withMessage('isPublic parameter is required.').isBoolean().withMessage('isPublic parameter should be a type of boolean.')
];