"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_validator_1 = require("express-validator");
var requestResetPasswordViaEmailRequest = [
    express_validator_1.check('email').not().isEmail()
];
exports.default = requestResetPasswordViaEmailRequest;
//# sourceMappingURL=AuthenticationApiRequest.js.map