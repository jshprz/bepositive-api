"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var typedi_1 = require("typedi");
var repositories_1 = require("../../infra/repositories");
var ses_1 = require("../../infra/ses");
require("reflect-metadata");
var crypto_1 = __importDefault(require("crypto"));
var ResetPasswordEmailTemplate_1 = __importDefault(require("../../templates/ResetPasswordEmailTemplate"));
var express_validator_1 = require("express-validator");
var ForgotPassword = /** @class */ (function () {
    function ForgotPassword() {
        var container = typedi_1.Container.of();
        this._userRepository = container.get(repositories_1.repositories.UserRepository);
        this._awsSes = container.get(ses_1.ses.AwsSes);
    }
    ForgotPassword.prototype.requestResetPasswordViaEmail = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var errors, cryptoBuffer, token, tokenExpiration, userEmail, subject, body, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        errors = express_validator_1.validationResult(req).mapped();
                        if (errors.email) {
                            return [2 /*return*/, res.status(400).json({
                                    message: errors.email.msg,
                                    error: 'bad request error',
                                    status: 400
                                })];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, crypto_1.default.randomBytes(32)];
                    case 2:
                        cryptoBuffer = _a.sent();
                        token = cryptoBuffer.toString('hex');
                        tokenExpiration = Date.now() + 3600000;
                        return [4 /*yield*/, this._userRepository.getUserByEmail(req.body.email)];
                    case 3:
                        userEmail = _a.sent();
                        if (!userEmail) {
                            return [2 /*return*/, res.status(404).json({
                                    message: 'email provided does not exist.',
                                    error: 'resource not found',
                                    status: 404
                                })];
                        }
                        return [4 /*yield*/, this._userRepository.updateUser(userEmail.id, {
                                resetToken: token,
                                resetTokenExpiration: tokenExpiration
                            })];
                    case 4:
                        _a.sent();
                        subject = 'Bepositive Reset Password';
                        body = ResetPasswordEmailTemplate_1.default(token);
                        return [4 /*yield*/, this._awsSes.sendResetPasswordEmail(userEmail.email, subject, body)];
                    case 5:
                        _a.sent();
                        res.status(200).json({
                            message: 'reset password token successfully sent to the email.',
                            payload: {},
                            status: 200
                        });
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        res.status(500).json({
                            message: 'Internal server error',
                            error: 'Internal server error',
                            status: 500
                        });
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    ForgotPassword.prototype.verifyResetToken = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var errors, tokenValidity, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        errors = express_validator_1.validationResult(req).mapped();
                        if (errors.token) {
                            return [2 /*return*/, res.status(400).json({
                                    message: errors.token.msg,
                                    error: 'bad request error',
                                    status: 400
                                })];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._userRepository.getUserByResetToken(req.params.token)];
                    case 2:
                        tokenValidity = _a.sent();
                        if (!tokenValidity) {
                            return [2 /*return*/, res.status(403).json({
                                    message: 'reset password token is not valid.',
                                    error: 'forbidden client error',
                                    status: 403
                                })];
                        }
                        return [2 /*return*/, res.status(200).json({
                                message: 'reset token is valid.',
                                payload: {
                                    token: tokenValidity.resetToken
                                },
                                status: 200
                            })];
                    case 3:
                        error_2 = _a.sent();
                        res.status(500).json({
                            message: 'internal server error',
                            error: 'internal server error',
                            status: 500
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ForgotPassword.prototype.resetPassword = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var errors, tokenValidity, body, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        errors = express_validator_1.validationResult(req).mapped();
                        if (errors.token) {
                            return [2 /*return*/, res.status(400).json({
                                    message: errors.token.msg,
                                    error: 'bad request error',
                                    status: 400
                                })];
                        }
                        if (errors.password) {
                            return [2 /*return*/, res.status(400).json({
                                    message: errors.password.msg,
                                    error: 'bad request error',
                                    status: 400
                                })];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this._userRepository.getUserByResetToken(req.params.token)];
                    case 2:
                        tokenValidity = _a.sent();
                        if (!tokenValidity) {
                            return [2 /*return*/, res.status(403).json({
                                    message: 'reset password token is not valid.',
                                    error: 'forbidden client error',
                                    status: 403
                                })];
                        }
                        body = {
                            password: req.body.password
                        };
                        return [4 /*yield*/, this._userRepository.updateUser(tokenValidity.id, body)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, res.status(200).json({
                                message: 'password reset successfully.',
                                payload: {},
                                status: 200
                            })];
                    case 4:
                        error_3 = _a.sent();
                        res.status(500).json({
                            message: 'internal server error',
                            error: 'internal server error',
                            status: 500
                        });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ForgotPassword = __decorate([
        typedi_1.Service(),
        __metadata("design:paramtypes", [])
    ], ForgotPassword);
    return ForgotPassword;
}());
exports.default = ForgotPassword;
//# sourceMappingURL=ForgotPassword.js.map