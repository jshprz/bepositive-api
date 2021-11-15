import { check } from "express-validator";

export const feedApiValidation = [
  check('pagination').not().isEmpty().withMessage('pagination property is required.').isObject().withMessage('pagination property should be object type.').custom((value) => {
    let pageErrorMessage: string | null = '';
    let sizeErrorMessage: string | null = '';

    if (value.page !== undefined && value.page !== null && value.page.length != 0 ) {
      if (value.page < 1 || typeof(value.page) === 'string') {
        pageErrorMessage = 'Pagination page property must be a positive number.';
      }
    } else {
      pageErrorMessage = 'Pagination page property is required.';
    }

    if (value.size !== undefined && value.size !== null && value.size.length != 0 ) {
      if (value.size < 1 || typeof(value.size) === 'string') {
        sizeErrorMessage = 'Pagination size property must be a positive number.';
      }
    } else {
      sizeErrorMessage = 'Pagination size property is required.';
    }

    const errors: string[] | null = [];
    if (pageErrorMessage.length > 0) {
      errors.push(pageErrorMessage)
    }
    if (sizeErrorMessage.length > 0) {
      errors.push(sizeErrorMessage)
    }

    if (errors && errors.length) {
      return Promise.reject(errors);
    } else {
      return Promise.resolve();
    }
  })
];

export const trendingFeedApiValidation = [
  check('pagination').not().isEmpty().withMessage('pagination property is required.').isObject().withMessage('pagination property should be object type.').custom((value) => {
    let pageErrorMessage: string | null = '';
    let sizeErrorMessage: string | null = '';

    if (value.page !== undefined && value.page !== null && value.page.length != 0 ) {
      if (value.page < 1 || typeof(value.page) === 'string') {
        pageErrorMessage = 'Pagination page property must be a positive number.';
      }
    } else {
      pageErrorMessage = 'Pagination page property is required.';
    }

    if (value.size !== undefined && value.size !== null && value.size.length != 0 ) {
      if (value.size < 1 || typeof(value.size) === 'string') {
        sizeErrorMessage = 'Pagination size property must be a positive number.';
      }
    } else {
      sizeErrorMessage = 'Pagination size property is required.';
    }

    const errors: string[] | null = [];
    if (pageErrorMessage.length > 0) {
      errors.push(pageErrorMessage)
    }
    if (sizeErrorMessage.length > 0) {
      errors.push(sizeErrorMessage)
    }

    if (errors && errors.length) {
      return Promise.reject(errors);
    } else {
      return Promise.resolve();
    }
  })
];