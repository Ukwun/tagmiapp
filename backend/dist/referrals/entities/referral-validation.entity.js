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
exports.ReferralValidation = exports.ValidationCheckpoint = void 0;
const typeorm_1 = require("typeorm");
const referral_entity_1 = require("./referral.entity");
var ValidationCheckpoint;
(function (ValidationCheckpoint) {
    ValidationCheckpoint["EMAIL_VERIFIED"] = "email_verified";
    ValidationCheckpoint["PHONE_VERIFIED"] = "phone_verified";
    ValidationCheckpoint["PROFILE_COMPLETED"] = "profile_completed";
    ValidationCheckpoint["FOLLOWED_USERS"] = "followed_users";
    ValidationCheckpoint["CREATED_CONTENT"] = "created_content";
    ValidationCheckpoint["SESSION_DAYS"] = "session_days";
    ValidationCheckpoint["SESSION_TIME"] = "session_time";
})(ValidationCheckpoint || (exports.ValidationCheckpoint = ValidationCheckpoint = {}));
let ReferralValidation = class ReferralValidation {
};
exports.ReferralValidation = ReferralValidation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ReferralValidation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid" }),
    __metadata("design:type", String)
], ReferralValidation.prototype, "referralId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "simple-enum",
        enum: ValidationCheckpoint,
    }),
    __metadata("design:type", String)
], ReferralValidation.prototype, "checkpoint", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ReferralValidation.prototype, "passed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-json", nullable: true }),
    __metadata("design:type", Object)
], ReferralValidation.prototype, "evidence", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ReferralValidation.prototype, "checkedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => referral_entity_1.Referral, (r) => r.validations),
    (0, typeorm_1.JoinColumn)({ name: "referralId" }),
    __metadata("design:type", referral_entity_1.Referral)
], ReferralValidation.prototype, "referral", void 0);
exports.ReferralValidation = ReferralValidation = __decorate([
    (0, typeorm_1.Entity)("referral_validations")
], ReferralValidation);
//# sourceMappingURL=referral-validation.entity.js.map