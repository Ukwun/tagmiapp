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
exports.Referral = exports.ReferralStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const referral_validation_entity_1 = require("./referral-validation.entity");
var ReferralStatus;
(function (ReferralStatus) {
    ReferralStatus["CLICKED"] = "clicked";
    ReferralStatus["REGISTERED"] = "registered";
    ReferralStatus["VALIDATING"] = "validating";
    ReferralStatus["VALIDATED"] = "validated";
    ReferralStatus["CREDITED"] = "credited";
    ReferralStatus["REJECTED"] = "rejected";
    ReferralStatus["EXPIRED"] = "expired";
})(ReferralStatus || (exports.ReferralStatus = ReferralStatus = {}));
let Referral = class Referral {
};
exports.Referral = Referral;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Referral.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid" }),
    __metadata("design:type", String)
], Referral.prototype, "referrerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid", nullable: true }),
    __metadata("design:type", String)
], Referral.prototype, "referredUserId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Referral.prototype, "referralCode", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "simple-enum",
        enum: ReferralStatus,
        default: ReferralStatus.CLICKED,
    }),
    __metadata("design:type", String)
], Referral.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Referral.prototype, "creditsAwarded", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Referral.prototype, "clickIp", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Referral.prototype, "registrationIp", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Referral.prototype, "deviceFingerprintHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Referral.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "datetime", nullable: true }),
    __metadata("design:type", Date)
], Referral.prototype, "validationDeadline", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Referral.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-json", nullable: true }),
    __metadata("design:type", Object)
], Referral.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Referral.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Referral.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: "referrerId" }),
    __metadata("design:type", user_entity_1.User)
], Referral.prototype, "referrer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "referredUserId" }),
    __metadata("design:type", user_entity_1.User)
], Referral.prototype, "referredUser", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => referral_validation_entity_1.ReferralValidation, (v) => v.referral),
    __metadata("design:type", Array)
], Referral.prototype, "validations", void 0);
exports.Referral = Referral = __decorate([
    (0, typeorm_1.Entity)("referrals"),
    (0, typeorm_1.Index)(["referrerId"]),
    (0, typeorm_1.Index)(["referredUserId"]),
    (0, typeorm_1.Index)(["status"])
], Referral);
//# sourceMappingURL=referral.entity.js.map