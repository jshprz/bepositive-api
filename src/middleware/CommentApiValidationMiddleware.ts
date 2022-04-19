import { check } from "express-validator";

export const addCommentApiValidation = [
  check('postId').not().isEmpty().withMessage('post id parameter is required.').isString().withMessage('post id parameter should be a type of string.'),
  check('content').not().isEmpty().withMessage('content parameter is required.')
]

export const getCommentsApiValidation = [
  check('postId').not().isEmpty().withMessage('post id parameter is required.').isString().withMessage('post id parameter should be a type of string.')
];

export const updateCommentApiValidation = [
  check('id').not().isEmpty().withMessage('id parameter is required.').isString().withMessage('id parameter should be a type of string.'),
  check('content').not().isEmpty().withMessage('content property is required.')
];

export const removeCommentApiValidation = [
  check('id').not().isEmpty().withMessage('id parameter is required.').isString().withMessage('id parameter should be a type of string.'),
];

export const likeOrUnlikeCommentApiValidation = [
  check('commentId').not().isEmpty().withMessage('commentId parameter is required.').isString().withMessage('commentId parameter should be of type string.'),
  check('postId').not().isEmpty().withMessage('postId parameter is required.').isString().withMessage('postId parameter should be of type string.'),
  check('like').not().isEmpty().withMessage('like parameter is required.').isBoolean().withMessage('like parameter should be of type boolean.'),
  check('classification').not().isEmpty().withMessage('classification property is required').isIn(['REGULAR_POST', 'SHARED_POST']).withMessage("classification property should only be 'REGULAR_POST' or 'SHARED_POST'.")
];