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
exports.TrackReferralDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class TrackReferralDto {
}
exports.TrackReferralDto = TrackReferralDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "The referral code (username of referrer)" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TrackReferralDto.prototype, "referralCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Device fingerprint hash" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TrackReferralDto.prototype, "fingerprint", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "User agent string" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TrackReferralDto.prototype, "userAgent", void 0);
//# sourceMappingURL=track-referral.dto.js.map