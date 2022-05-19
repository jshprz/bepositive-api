import { check } from "express-validator";

export const searchUserOrHashtagApiValidation = [
    check('searchQuery').not().isEmpty().withMessage('searchQuery property is required.')
];