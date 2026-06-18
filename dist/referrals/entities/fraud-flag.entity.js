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
exports.FraudFlag = exports.FraudFlagStatus = exports.FraudFlagSeverity = exports.FraudFlagType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const referral_entity_1 = require("./referral.entity");
var FraudFlagType;
(function (FraudFlagType) {
    FraudFlagType["DUPLICATE_DEVICE"] = "duplicate_device";
    FraudFlagType["SAME_IP_SUBNET"] = "same_ip_subnet";
    FraudFlagType["VPN_PROXY"] = "vpn_proxy";
    FraudFlagType["RAPID_SIGNUPS"] = "rapid_signups";
    FraudFlagType["SIMILAR_CREDENTIALS"] = "similar_credentials";
    FraudFlagType["LOW_SESSION_QUALITY"] = "low_session_quality";
    FraudFlagType["VELOCITY_EXCEEDED"] = "velocity_exceeded";
    FraudFlagType["CIRCULAR_REFERRAL"] = "circular_referral";
    FraudFlagType["PHONE_REUSE"] = "phone_reuse";
    FraudFlagType["COLLUSION_PATTERN"] = "collusion_pattern";
})(FraudFlagType || (exports.FraudFlagType = FraudFlagType = {}));
var FraudFlagSeverity;
(function (FraudFlagSeverity) {
    FraudFlagSeverity["LOW"] = "low";
    FraudFlagSeverity["MEDIUM"] = "medium";
    FraudFlagSeverity["HIGH"] = "high";
    FraudFlagSeverity["CRITICAL"] = "critical";
})(FraudFlagSeverity || (exports.FraudFlagSeverity = FraudFlagSeverity = {}));
var FraudFlagStatus;
(function (FraudFlagStatus) {
    FraudFlagStatus["OPEN"] = "open";
    FraudFlagStatus["INVESTIGATING"] = "investigating";
    FraudFlagStatus["CONFIRMED"] = "confirmed";
    FraudFlagStatus["DISMISSED"] = "dismissed";
})(FraudFlagStatus || (exports.FraudFlagStatus = FraudFlagStatus = {}));
let FraudFlag = class FraudFlag {
};
exports.FraudFlag = FraudFlag;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], FraudFlag.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid", nullable: true }),
    __metadata("design:type", String)
], FraudFlag.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid", nullable: true }),
    __metadata("design:type", String)
], FraudFlag.prototype, "referralId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "simple-enum",
        enum: FraudFlagType,
    }),
    __metadata("design:type", String)
], FraudFlag.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "simple-enum",
        enum: FraudFlagSeverity,
        default: FraudFlagSeverity.MEDIUM,
    }),
    __metadata("design:type", String)
], FraudFlag.prototype, "severity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "simple-enum",
        enum: FraudFlagStatus,
        default: FraudFlagStatus.OPEN,
    }),
    __metadata("design:type", String)
], FraudFlag.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], FraudFlag.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-json", nullable: true }),
    __metadata("design:type", Object)
], FraudFlag.prototype, "evidence", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], FraudFlag.prototype, "resolution", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], FraudFlag.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "userId" }),
    __metadata("design:type", user_entity_1.User)
], FraudFlag.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => referral_entity_1.Referral, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "referralId" }),
    __metadata("design:type", referral_entity_1.Referral)
], FraudFlag.prototype, "referral", void 0);
exports.FraudFlag = FraudFlag = __decorate([
    (0, typeorm_1.Entity)("fraud_flags"),
    (0, typeorm_1.Index)(["userId"]),
    (0, typeorm_1.Index)(["referralId"]),
    (0, typeorm_1.Index)(["status"])
], FraudFlag);
//# sourceMappingURL=fraud-flag.entity.js.map