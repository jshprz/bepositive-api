import { check } from "express-validator";

export const followUserApiValidation = [
    check('followeeCognitoSub').not().isEmpty().withMessage('followeeCognitoSub parameter is required.').isString().withMessage('followeeCognitoSub should be a type of string.')
];

export const profileUpdateApiValidation = [
    check('attributes').not().isEmpty().withMessage('attributes parameter is required.').isObject().withMessage('attributes property should be of type object.'),
    check('attributes.name').optional().not().isEmpty().withMessage('name property should not be empty.'),
    check('attributes.gender').optional().not().isEmpty().isIn(['female', "male", "others"]).withMessage("gender property should only be 'female', 'male, or 'others'."),
    check('attributes.profileTitle').optional().not().isEmpty().withMessage('profileTitle property should not be empty.'),
    check('attributes.profileDescription').optional().not().isEmpty().withMessage('profileDescription property should not be empty.'),
    check('attributes.dateOfBirth').optional().not().isEmpty().withMessage('dateOfBirth property should not be empty.').isDate().withMessage('dateOfBirth property accepted format is: YYYY-MM-DD'),
    check('attributes.website').optional().not().isEmpty().withMessage('website property should not be empty.').isURL().withMessage('website property should be a valid website URL'),
    check('attributes.city').optional().not().isEmpty().withMessage('city property should not be empty.'),
    check('attributes.state').optional().not().isEmpty().withMessage('state property should not be empty.'),
    check('attributes.zipcode').optional().not().isEmpty().withMessage('zipcode property should not be empty.').isNumeric().withMessage('zipcode property should be a numeric'),
    check('attributes.country').optional().not().isEmpty().withMessage('country property should not be empty.'),
    check('attributes.phoneNumber').optional().not().isEmpty().withMessage('phoneNumber property should not be empty.').isNumeric().withMessage('phoneNumber property must be a valid phone number.')
];

export const updatePrivacyApiValidation = [
    check('isPublic').not().isEmpty().withMessage('isPublic parameter is required.').isBoolean().withMessage('isPublic parameter should be a type of boolean.')
];
