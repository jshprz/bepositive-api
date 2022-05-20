import {check, query} from "express-validator";

export const searchUserOrHashtagApiValidation = [
    query('searchQuery').not().isEmpty().withMessage('searchQuery query param is required.')
];