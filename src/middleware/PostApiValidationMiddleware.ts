import { check } from "express-validator";
import path from 'path';
import mime from 'mime';

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