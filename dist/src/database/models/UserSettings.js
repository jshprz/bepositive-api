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
exports.UserSettings = void 0;
var typeorm_1 = require("typeorm");
var Users_1 = require("./Users");
var UserSettings = /** @class */ (function () {
    function UserSettings() {
    }
    __decorate([
        typeorm_1.PrimaryGeneratedColumn({ type: "int", unsigned: true }),
        __metadata("design:type", Number)
    ], UserSettings.prototype, "id", void 0);
    __decorate([
        typeorm_1.ManyToOne(function (type) { return Users_1.Users; }),
        typeorm_1.JoinColumn(),
        typeorm_1.Column({ type: "int", nullable: false, unsigned: true }),
        __metadata("design:type", Users_1.Users)
    ], UserSettings.prototype, "user", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 50, nullable: false, unique: true }),
        __metadata("design:type", String)
    ], UserSettings.prototype, "options", void 0);
    __decorate([
        typeorm_1.Column({ type: "text", nullable: false }),
        __metadata("design:type", String)
    ], UserSettings.prototype, "value", void 0);
    __decorate([
        typeorm_1.Column({ type: "bigint", nullable: false }),
        __metadata("design:type", Number)
    ], UserSettings.prototype, "created_at", void 0);
    __decorate([
        typeorm_1.Column({ type: "bigint", nullable: true }),
        __metadata("design:type", Number)
    ], UserSettings.prototype, "updated_at", void 0);
    __decorate([
        typeorm_1.Column({ type: "bigint", nullable: true }),
        __metadata("design:type", Number)
    ], UserSettings.prototype, "deleted_at", void 0);
    UserSettings = __decorate([
        typeorm_1.Entity({ name: "user_settings" })
    ], UserSettings);
    return UserSettings;
}());
exports.UserSettings = UserSettings;
//# sourceMappingURL=UserSettings.js.map