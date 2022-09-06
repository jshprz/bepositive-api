import {check, query} from "express-validator";

export const addCommentApiValidation = [
    check('postId').not().isEmpty().withMessage('post id parameter is required.').isString().withMessage('post id parameter should be a type of string.'),
    check('content').not().isEmpty().withMessage('content parameter is required.'),
    check('classification').not().isEmpty().withMessage('classification property is required').isIn(['REGULAR_POST', 'SHARED_POST']).withMessage("classification property should only be 'REGULAR_POST' or 'SHARED_POST'.")
]

export const getCommentsApiValidation = [
  check('postId').not().isEmpty().withMessage('post id parameter is required.').isString().withMessage('post id parameter should be a type of string.'),
  query('classification').not().isEmpty().withMessage('classification query param is required').isIn(['REGULAR_POST', 'SHARED_POST']).withMessage("classification query param should only be 'REGULAR_POST' or 'SHARED_POST'.")
];

export const updateCommentOrReplyApiValidation = [
  check('id').not().isEmpty().withMessage('id parameter is required.').isString().withMessage('id parameter should be a type of string.'),
  check('content').not().isEmpty().withMessage('content property is required.'),
  check('type').not().isEmpty().withMessage('type property is required').isIn(['comment', 'reply']).withMessage("type property should only be 'comment' or 'reply'.")
];

export const removeCommentOrReplyApiValidation = [
  check('id').not().isEmpty().withMessage('id parameter is required.').isString().withMessage('id parameter should be a type of string.'),
  check('type').not().isEmpty().withMessage('type property is required').isIn(['comment', 'reply']).withMessage("type property should only be 'comment' or 'reply'.")
];

export const likeOrUnlikeCommentOrReplyApiValidation = [
  check('commentId').not().isEmpty().withMessage('commentId parameter is required.').isString().withMessage('commentId parameter should be of type string.'),
  check('postId').not().isEmpty().withMessage('postId parameter is required.').isString().withMessage('postId parameter should be of type string.'),
  check('like').not().isEmpty().withMessage('like parameter is required.').isBoolean().withMessage('like parameter should be of type boolean.'),
  check('classification').not().isEmpty().withMessage('classification property is required').isIn(['REGULAR_POST', 'SHARED_POST']).withMessage("classification property should only be 'REGULAR_POST' or 'SHARED_POST'."),
  check('commentType').not().isEmpty().withMessage('comment type property is required').isIn(['comment', 'reply']).withMessage("type property should only be 'comment' or 'reply'.")
];

export const replyToCommentApiValidation = [
  check('commentId').not().isEmpty().withMessage('commentId parameter is required.').isString().withMessage('commentId parameter should be of type string.'),
  check('content').not().isEmpty().withMessage('content parameter is required.').isString().withMessage('content parameter should be of type string.'),
]