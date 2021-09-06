"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var typedi_1 = require("typedi");
require("reflect-metadata");
var ForgotPassword_1 = __importDefault(require("../app/authentication/ForgotPassword"));
var express_validator_1 = require("express-validator");
var router = express_1.default.Router();
var forgotPassword = typedi_1.Container.get(ForgotPassword_1.default);
router.post('/login', function (req, res) { res.end(); });
/**
 * @openapi
 * /:
 *  post:
 *    description: creates a reset password token and its expiration then sends it via email.
 *    operation: requestResetPasswordViaEmail
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *          properties:
 *            email:
 *              type: string
 *    responses:
 *      200:
 *        description: request reset password via email successful response
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              items:
 *                message: Reset password token successfully sent to the email.
 *                payload: {}
 *                status: 200
 *      400:
 *        description: bad request error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              items:
 *                message: email property is required
 *                error: bad request error
 *                status: 400
 *      404:
 *        description: resource not found
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              items:
 *                message: email provided does not exist
 *                error: resource not found
 *                status: 404
 *      500:
 *        description: internal server error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              items:
 *                message: internal server error
 *                error: internal server error
 *                status: 500
 *
 */
router.post('/password/email', [
    express_validator_1.check('email').not().isEmpty().withMessage('email property is required.').isEmail().withMessage('email property value is invalid.')
], function (req, res) { return forgotPassword.requestResetPasswordViaEmail(req, res); });
/**
 * @openapi
 * /:
 *  get:
 *    description: verifies the validity of the token.
 *    operation: verifyResetToken
 *    parameters:
 *      schema:
 *        type: string
 *    - name: token
 *      in: path
 *      required: true
 *    responses:
 *      200:
 *        description: reset token validity confirmation.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              items:
 *                message: reset token is valid.
 *                payload: {
 *                  token:
 *                    type: string
 *                }
 *                status: 200
 *      400:
 *        description: bad request error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              items:
 *                token:
 *                  message: token parameter is required
 *                  error: bad request error
 *                  status: 400
 *      403:
 *        description: forbidden client error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              items:
 *                message: reset password token is not valid
 *                error: forbidden client error
 *                status: 403
 *      500:
 *        description: internal server error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              items:
 *                message: internal server error
 *                error: internal server error
 *                status: 500
 *
 */
router.get('/password/verify/:token', [
    express_validator_1.param('token').not().isEmpty().withMessage('token parameter is required.')
], function (req, res) { return forgotPassword.verifyResetToken(req, res); });
/**
 * @openapi
 * /:
 *  patch:
 *    description: resets the user password.
 *    operation: resetPassword
 *    parameters:
 *      schema:
 *        type: string
 *    - name: token
 *      in: path
 *      required: true
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *          properties:
 *            password:
 *              type: string
 *            confirmPassword:
 *              type: string
 *    responses:
 *      200:
 *        description: password reset successful response.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              items:
 *                message: password reset successfully.
 *                payload: {}
 *                status: 200
 *      400:
 *        description: bad request error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              items:
 *                token:
 *                  message: token parameter is required
 *                  error: bad request error
 *                  status: 400
 *                password:
 *                  message: password property is required. | password length atleast 6 character. | password is not match.
 *                  error: bad request error
 *                  status: 400
 *      403:
 *        description: forbidden client error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              items:
 *                message: reset password token is not valid.
 *                error: forbidden client error
 *                status: 403
 *      500:
 *        description: internal server error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              items:
 *                message: internal server error
 *                error: internal server error
 *                status: 500
 *
 */
router.patch('/password/reset/:token', [
    express_validator_1.param('token').not().isEmpty().withMessage('token parameter is required.'),
    express_validator_1.check('password').not().isEmpty().withMessage('password property is required.').isLength({ min: 6 }).withMessage('password length atleast 6 character.').custom(function (value, _a) {
        var req = _a.req;
        if (value !== req.body.confirmPassword) {
            return Promise.reject('password is not match.');
        }
        return Promise.resolve();
    })
], function (req, res) { return forgotPassword.resetPassword(req, res); });
exports.default = router;
//# sourceMappingURL=AuthenticationApi.js.map