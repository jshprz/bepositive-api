import { check } from "express-validator";
import path from 'path';
import mime from 'mime';

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
  check('google_maps_place_id').isString().withMessage('google_maps_place_id should be type of string.')
];

export const likeOrUnlikePostApiValidation = [
  check('postId').not().isEmpty().withMessage('Post ID property is required and must be a string').custom((value) => {
    if (typeof(value) !== 'string') {
      return Promise.reject('Post ID property is required and must be a string');
    } else {
      return Promise.resolve();
    }
  })
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