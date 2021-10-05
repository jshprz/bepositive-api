import { check } from "express-validator";

export const createPostApiValidation = [
  check('caption').not().isEmpty().withMessage('caption property is required.')
];