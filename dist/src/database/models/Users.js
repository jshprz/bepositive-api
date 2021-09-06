"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.Users = void 0;
var typeorm_1 = require("typeorm");
var Users = /** @class */ (function (_super) {
    __extends(Users, _super);
    function Users() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        typeorm_1.PrimaryGeneratedColumn({ type: "int", unsigned: true }),
        __metadata("design:type", Number)
    ], Users.prototype, "id", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 50, nullable: false, unique: true }),
        __metadata("design:type", String)
    ], Users.prototype, "email", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 50, nullable: false }),
        __metadata("design:type", String)
    ], Users.prototype, "password", void 0);
    __decorate([
        typeorm_1.Column({ type: "char", length: 10, nullable: false }),
        __metadata("design:type", String)
    ], Users.prototype, "account_status", void 0);
    __decorate([
        typeorm_1.Column({ type: "bigint", nullable: true }),
        __metadata("design:type", Number)
    ], Users.prototype, "verified_at", void 0);
    __decorate([
        typeorm_1.Column({ type: 'varchar', nullable: true }),
        __metadata("design:type", String)
    ], Users.prototype, "resetToken", void 0);
    __decorate([
        typeorm_1.Column({ type: 'bigint', nullable: true }),
        __metadata("design:type", Number)
    ], Users.prototype, "resetTokenExpiration", void 0);
    __decorate([
        typeorm_1.Column({ type: "bigint", nullable: false }),
        __metadata("design:type", Number)
    ], Users.prototype, "created_at", void 0);
    __decorate([
        typeorm_1.Column({ type: "bigint", nullable: true }),
        __metadata("design:type", Number)
    ], Users.prototype, "updated_at", void 0);
    __decorate([
        typeorm_1.Column({ type: "bigint", nullable: true }),
        __metadata("design:type", Number)
    ], Users.prototype, "deleted_at", void 0);
    Users = __decorate([
        typeorm_1.Entity({ name: "users" })
    ], Users);
    return Users;
}(typeorm_1.BaseEntity));
exports.Users = Users;
//# sourceMappingURL=Users.js.map