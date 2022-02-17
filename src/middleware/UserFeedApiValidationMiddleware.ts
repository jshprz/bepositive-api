import { query } from "express-validator";

export const feedApiValidation = [
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