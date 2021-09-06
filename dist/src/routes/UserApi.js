"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var typedi_1 = require("typedi");
require("reflect-metadata");
var Account_1 = __importDefault(require("../app/user/Account"));
var router = express_1.default.Router();
var account = typedi_1.Container.get(Account_1.default);
router.post('/registration', function (req, res) { return account.registerUser(req, res); });
router.post('/update-user', function (req, res) { return account.updateUser(req, res); });
exports.default = router;
//# sourceMappingURL=UserApi.js.map