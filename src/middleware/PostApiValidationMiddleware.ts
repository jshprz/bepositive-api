import {check, query} from "express-validator";
import path from 'path';
import mime from 'mime';


export const getPostsByHashtagApiValidation = [
  query('page').not().isEmpty().withMessage('page query parameter is required.').isNumeric().withMessage('page query parameter must be a numeric type.').custom((value: number, { req }) => {
    if (value < 1) {
      return Promise.reject('page query parameter must be a positive number and cannot contain zero.')
    }

    return Promise.resolve();
  }),
  query('size').not().isEmpty().withMessage('size query parameter is required.').isNumeric().withMessage('size query parameter must be a numeric type.').custom((value: number, { req }) => {
    if (value < 1) {
      return Promise.reject('size query parameter must be a positive number and cannot contain zero.')
    }

    return Promise.resolve();
  })
];

export const updateSharedPost = [
  check('id').not().isEmpty().withMessage('id parameter is required.').isString().withMessage('id parameter should be a type of string.'),
  check('shareCaption').not().isEmpty().withMessage('shareCaption property is required.')
];

export const getSharedPostByIdApiValidation = [
  check('id').not().isEmpty().withMessage('id parameter is required.').isString().withMessage('id parameter should be a type of string.'),
];

export const sharePostByIdApiValidation = [
  check('id').not().isEmpty().withMessage('id parameter is required.').isString().withMessage('id parameter should be a type of string.'),
  check('shareCaption').not().isEmpty().withMessage('shareCaption property is required.')
];

export const removePostApiValidation = [
  check('id').not().isEmpty().withMessage('id parameter is required.').isString().withMessage('id parameter should be a type of string.'),
  check('classification').not().isEmpty().withMessage('classification property is required').isIn(['REGULAR_POST', 'SHARED_POST']).withMessage("classification property should only be 'REGULAR_POST' or 'SHARED_POST'.")
];

export const updatePostApiValidation = [
  check('id').not().isEmpty().withMessage('id parameter is required.').isString().withMessage('id parameter should be a type of string.'),
  check('caption').not().isEmpty().withMessage('caption property is required.')
];

export const getPostByIdApiValidation = [
  check('id').not().isEmpty().withMessage('id parameter is required.').isString().withMessage('id parameter should be a type of string.')
];

export const createPostApiValidation = [
  check('caption').not().isEmpty().withMessage('caption property is required.'),
  check('files').not().isEmpty().withMessage('files property is required.').isArray().withMessage('files property should be array type.').custom((value: {key: string, type: string}[]) => {
    let errorMessage: string | null = '';

    value.forEach(async (file: {key: string, type: string}) => {
      if (!file.key || !file.type) {
        errorMessage = 'each file object should contain key and type property.';
        return;
      } else {
        const extension: string = (path.extname(file.key)).toLowerCase();
        const keyValidation: {isFailed: boolean, message: string | null} = validateKey(extension);

        if (keyValidation.isFailed) {
          errorMessage = keyValidation.message;
          return;
        }
        if (keyValidation.message !== file.type) {
          errorMessage = `key extension and type property mismatch: key(${file.key}) : type(${file.type})`;
          return;
        }
      }
    });

    if (errorMessage.length <= 0) {
      return Promise.resolve();
    } else {
      return Promise.reject(errorMessage);
    }
  }),
  check('googleMapsPlaceId').isString().withMessage('googleMapsPlaceId should be type of string.')
];

export const likeOrUnlikePostApiValidation = [
  check('postId').not().isEmpty().withMessage('postId parameter is required.').isString().withMessage('postId parameter should be of type string.'),
  check('like').not().isEmpty().withMessage('like parameter is required.').isBoolean().withMessage('like parameter should be of type boolean.'),
  check('classification').not().isEmpty().withMessage('classification property is required').isIn(['REGULAR_POST', 'SHARED_POST']).withMessage("classification property should only be 'REGULAR_POST' or 'SHARED_POST'.")
];

export const flagPostApiValidation = [
  check('id').not().isEmpty().withMessage('id parameter is required.').isString().withMessage('id parameter should be type of string.'),
  check('classification').optional().isIn(['REGULAR_POST', 'SHARED_POST']).withMessage("classification property should only be 'REGULAR_POST or 'SHARED_POST'."),
  check('reason').not().isEmpty().withMessage('reason property is required.')
];

function validateKey(extension: string): {isFailed: boolean, message: string | null} {
    switch (extension) {
      case '.jpg':
      case '.jpeg':
      case '.png':
      case '.gif':
      case '.mp4':
      case '.mpeg':
      case '.mov':
        return {
          isFailed: false,
          message: mime.getType(extension)
        }
      case '':
        return {
          isFailed: true,
          message: 'key should contain extension'
        }
      default:
        return {
          isFailed: true,
          message: `${extension} is unsupported file format`
        }
    }
}