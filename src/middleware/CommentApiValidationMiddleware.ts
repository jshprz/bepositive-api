import { check } from "express-validator";

export const addCommentApiValidation = [
  check('postId').not().isEmpty().withMessage('post id parameter is required.').isNumeric(),
  check('content').not().isEmpty().withMessage('content parameter is required.')
]