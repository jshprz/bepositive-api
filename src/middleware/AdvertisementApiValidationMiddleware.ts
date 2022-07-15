
import { check } from "express-validator";
import path from 'path';
import mime from 'mime';

export const createAdApiValidation = [
  check('caption').not().isEmpty().withMessage('caption property is required.'),
  check('name').not().isEmpty().withMessage('name property is required.'),
  check('link').not().isEmpty().withMessage('link property is required.'),
  check('googleMapsPlaceId').isString().withMessage('googleMapsPlaceId should be type of string.'),
  check('isSponsored').not().isEmpty().withMessage('isSponsored parameter is required.').isBoolean().withMessage('isSponsored parameter should be of type boolean.'),
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
];

export const updateAdApiValidation = [
  check('id').not().isEmpty().withMessage('id parameter is required.').isString().withMessage('id parameter should be a type of string.'),
  check('caption').not().isEmpty().withMessage('caption property is required.')
];

export const removeAdApiValidation = [
  check('id').not().isEmpty().withMessage('id parameter is required.').isString().withMessage('id parameter should be a type of string.'),
];

export const getAdByIdApiValidation = [
  check('id').not().isEmpty().withMessage('id parameter is required.').isString().withMessage('id parameter should be a type of string.')
];

export const updateAdViewCountApiValidation = [
  check('id').not().isEmpty().withMessage('id parameter is required.').isString().withMessage('id parameter should be a type of string.'),
];

export const likeOrUnlikeAdvertisementApiValidation = [
  check('advertisementId').not().isEmpty().withMessage('advertisementId parameter is required.').isString().withMessage('advertisementId parameter should be of type string.'),
  check('like').not().isEmpty().withMessage('like parameter is required.').isBoolean().withMessage('like parameter should be of type boolean.'),
];

export const flagAdvertisementApiValidation = [
  check('id').not().isEmpty().withMessage('id parameter is required.').isString().withMessage('id parameter should be type of string.'),
  check('reason').not().isEmpty().withMessage('reason property is required.')
];

export const uploadAdAvatarApiValidation = [
  check('advertisementId').not().isEmpty().withMessage('Advertisement ID property is required.'),
  check('files').not().isEmpty().withMessage('files property is required.').isObject().withMessage('file property should be object type.').custom((file: {key: string, type: string}) => {

    let errorMessage: string | null = '';

      if (!file.key || !file.type) {
        errorMessage = 'file object should contain key and type property.';
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

    if (errorMessage.length <= 0) {
      return Promise.resolve();
    } else {
      return Promise.reject(errorMessage);
    }

  }),
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
