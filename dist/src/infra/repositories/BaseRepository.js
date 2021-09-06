"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
Object.defineProperty(exports, "__esModule", { value: true });
var typeorm_1 = require("typeorm");
var typedi_1 = require("typedi");
var index_1 = require("../utils/index");
var BaseRepository = /** @class */ (function () {
    function BaseRepository() {
        this._log = typedi_1.Container.get(index_1.utils.Logger);
    }
    /**
     * Creates user record in the database table.
     * @param item { email: string, password: string, account_status: string }
     * @param entity any
     * @returns Promise<any>
     */
    BaseRepository.prototype.create = function (item, entity) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        entity.email = item.email;
                        entity.password = item.password;
                        entity.account_status = item.account_status;
                        entity.created_at = Number(Date.now());
                        return [4 /*yield*/, entity.save().catch(function (err) {
                                _this._log.error({
                                    label: 'UserRepository - BaseRepository - create()',
                                    message: "\n error: Database operation error \n details: " + (err.detail || err.message) + " \n query: " + err.query,
                                    payload: {
                                        item: item,
                                        entity: entity
                                    }
                                });
                                throw new Error('Database operation error');
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Updates user record in the database table.
     * @param id string
     * @param item object
     * @param entity string
     * @returns Promise<any>
     */
    BaseRepository.prototype.update = function (id, item, entity) {
        return __awaiter(this, void 0, void 0, function () {
            var modifiedItem;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        modifiedItem = __assign(__assign({}, item), { updated_at: Number(Date.now()) });
                        return [4 /*yield*/, typeorm_1.getConnection()
                                .createQueryBuilder()
                                .update(entity)
                                .set(modifiedItem)
                                .where('id = :id', { id: id })
                                .execute()
                                .catch(function (err) {
                                _this._log.error({
                                    label: 'UserRepository - BaseRepository - update()',
                                    message: "\n error: Database operation error \n details: " + (err.detail || err.message) + " \n query: " + err.query,
                                    payload: {
                                        id: id,
                                        item: item,
                                        entity: entity
                                    }
                                });
                                throw new Error('Database operation error');
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Get a user by its id in the database table.
     * @param id string
     * @param entity any
     * @param table string
     * @returns Promise<any>
     */
    BaseRepository.prototype.getById = function (id, entity, table) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, typeorm_1.getConnection()
                            .createQueryBuilder()
                            .select(table)
                            .from(entity, table)
                            .where('id = :id', { id: id })
                            .getOne()
                            .catch(function (err) {
                            _this._log.error({
                                label: 'UserRepository - BaseRepository - getById()',
                                message: "\n error: Database operation error \n details: " + (err.detail || err.message) + " \n query: " + err.query,
                                payload: {
                                    id: id,
                                    entity: entity,
                                    table: table
                                }
                            });
                            throw new Error('Database operation error');
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return BaseRepository;
}());
exports.default = BaseRepository;
//# sourceMappingURL=BaseRepository.js.map