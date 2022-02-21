import { check } from "express-validator";

export const followUserApiValidation = [
    check('followeeCognitoSub').not().isEmpty().withMessage('followeeCognitoSub parameter is required.').isString().withMessage('followeeCognitoSub should be a type of string.')
];