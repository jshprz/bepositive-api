"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apis = void 0;
var UserApi_1 = __importDefault(require("./UserApi"));
var AuthenticationApi_1 = __importDefault(require("./AuthenticationApi"));
exports.apis = {
    UserApi: UserApi_1.default,
    AuthenticationApi: AuthenticationApi_1.default
};
//# sourceMappingURL=index.js.map