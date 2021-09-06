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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
var winston_1 = require("winston");
var typedi_1 = require("typedi");
require("reflect-metadata");
var combine = winston_1.format.combine, printf = winston_1.format.printf;
/**
 * To use this logger dependency, it is recommended to follow the format pretty much similar to these:
 * *passing a payload argument is optional.
 *
 * .error({label: string, message: string, payload: {}});
 * .warn({label: string, message: string, payload: {}});
 * .info({label: string, message: string, payload: {}});
 * .http({label: string, message: string, payload: {}});
 * .debug({label: string, message: string, payload: {}});
 */
var Logger = /** @class */ (function () {
    function Logger() {
        var myFormat = printf(function (_a) {
            var level = _a.level, message = _a.message;
            var logLevel = level.toUpperCase();
            // We do not include the date in the log if our environment is in dev, staging, or production.
            // because we use AWS Cloudwatch there. The log data and time is taken care of for us.
            var logDate = (process.env.NODE_ENV === 'local') ? "[" + new Date().toLocaleString() + "]" : '';
            // Log returns the combination of datetime, context of the log (eg. ForgotPassword.ts), log message
            return logDate + "[" + logLevel + "]: " + message;
        });
        this._logger = winston_1.createLogger({
            level: 'info',
            format: combine(myFormat),
            transports: [
                new winston_1.transports.Console()
            ]
        });
    }
    Logger.prototype.error = function (message) {
        this._log('error', message);
    };
    Logger.prototype.warn = function (message) {
        this._log('warn', message);
    };
    Logger.prototype.info = function (message) {
        this._log('info', message);
    };
    Logger.prototype.http = function (message) {
        this._log('http', message);
    };
    Logger.prototype.debug = function (message) {
        this._log('debug', message);
    };
    Logger.prototype._log = function (level, message) {
        this._logger.log(level, JSON.stringify(message));
    };
    Logger = __decorate([
        typedi_1.Service(),
        __metadata("design:paramtypes", [])
    ], Logger);
    return Logger;
}());
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map