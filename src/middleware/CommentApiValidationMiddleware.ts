import { check } from "express-validator";

export const addCommentApiValidation = [
  check('postId').not().isEmpty().withMessage('post id parameter is required.').isNumeric(),
  check('content').not().isEmpty().withMessage('content parameter is required.')
]

export const getCommentsApiValidation = [
  check('postId').not().isEmpty().withMessage('post id parameter is required.').isNumeric().withMessage('post id parameter should be a type of number.')
];

export const updateCommentApiValidation = [
  check('id').not().isEmpty().withMessage('id parameter is required.').isNumeric().withMessage('id parameter should be a type of number.'),
  check('content').not().isEmpty().withMessage('content property is required.')
];

export const removeCommentApiValidation = [
  check('id').not().isEmpty().withMessage('id parameter is required.').isNumeric().withMessage('id parameter should be a type of number.'),
];