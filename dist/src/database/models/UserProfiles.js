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
exports.UserProfiles = void 0;
var typeorm_1 = require("typeorm");
var Users_1 = require("./Users");
var UserProfiles = /** @class */ (function () {
    function UserProfiles() {
    }
    __decorate([
        typeorm_1.PrimaryGeneratedColumn({ type: "int", unsigned: true }),
        __metadata("design:type", Number)
    ], UserProfiles.prototype, "id", void 0);
    __decorate([
        typeorm_1.ManyToOne(function (type) { return Users_1.Users; }),
        typeorm_1.JoinColumn(),
        typeorm_1.Column({ type: "int", nullable: false, unsigned: true }),
        __metadata("design:type", Users_1.Users)
    ], UserProfiles.prototype, "user", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 50, nullable: false }),
        __metadata("design:type", String)
    ], UserProfiles.prototype, "first_name", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 50, nullable: false }),
        __metadata("design:type", String)
    ], UserProfiles.prototype, "last_name", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 255, nullable: false }),
        __metadata("design:type", String)
    ], UserProfiles.prototype, "avatar_key", void 0);
    __decorate([
        typeorm_1.Column({ type: "char", length: 6, nullable: false }),
        __metadata("design:type", String)
    ], UserProfiles.prototype, "gender", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 50, nullable: true }),
        __metadata("design:type", String)
    ], UserProfiles.prototype, "profile_description", void 0);
    __decorate([
        typeorm_1.Column({ type: "bigint", nullable: false }),
        __metadata("design:type", Number)
    ], UserProfiles.prototype, "dob", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 255, nullable: true }),
        __metadata("design:type", String)
    ], UserProfiles.prototype, "about", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 255, nullable: true }),
        __metadata("design:type", String)
    ], UserProfiles.prototype, "website", void 0);
    __decorate([
        typeorm_1.Column({ type: "char", length: 50, nullable: true }),
        __metadata("design:type", String)
    ], UserProfiles.prototype, "city", void 0);
    __decorate([
        typeorm_1.Column({ type: "char", length: 50, nullable: true }),
        __metadata("design:type", String)
    ], UserProfiles.prototype, "state", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 50, nullable: true }),
        __metadata("design:type", String)
    ], UserProfiles.prototype, "zipcode", void 0);
    __decorate([
        typeorm_1.Column({ type: "char", length: 50, nullable: true }),
        __metadata("design:type", String)
    ], UserProfiles.prototype, "country", void 0);
    __decorate([
        typeorm_1.Column({ type: "varchar", length: 50, nullable: true }),
        __metadata("design:type", String)
    ], UserProfiles.prototype, "contact_detail", void 0);
    __decorate([
        typeorm_1.Column({ type: "char", length: 10, nullable: false }),
        __metadata("design:type", String)
    ], UserProfiles.prototype, "status", void 0);
    __decorate([
        typeorm_1.Column({ type: "bigint", nullable: false }),
        __metadata("design:type", Number)
    ], UserProfiles.prototype, "created_at", void 0);
    __decorate([
        typeorm_1.Column({ type: "bigint", nullable: true }),
        __metadata("design:type", Number)
    ], UserProfiles.prototype, "updated_at", void 0);
    __decorate([
        typeorm_1.Column({ type: "bigint", nullable: true }),
        __metadata("design:type", Number)
    ], UserProfiles.prototype, "deleted_at", void 0);
    UserProfiles = __decorate([
        typeorm_1.Entity({ name: "user_profiles" })
    ], UserProfiles);
    return UserProfiles;
}());
exports.UserProfiles = UserProfiles;
//# sourceMappingURL=UserProfiles.js.map