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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferralsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const referrals_service_1 = require("./referrals.service");
const validation_pipeline_service_1 = require("./services/validation-pipeline.service");
const track_referral_dto_1 = require("./dto/track-referral.dto");
let ReferralsController = class ReferralsController {
    constructor(referralsService, validationPipelineService) {
        this.referralsService = referralsService;
        this.validationPipelineService = validationPipelineService;
    }
    async trackReferralClick(dto, ip) {
        return this.referralsService.trackReferralClick(dto.referralCode, ip, dto.fingerprint, dto.userAgent);
    }
    async getMyReferrals(req, page, limit) {
        const result = await this.referralsService.getMyReferrals(req.user.id, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20);
        for (const referral of result.data) {
            if (referral.status === "validating") {
                await this.validationPipelineService.runValidation(referral.id);
            }
        }
        return this.referralsService.getMyReferrals(req.user.id, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20);
    }
    async getReferralStats(req) {
        return this.referralsService.getReferralStats(req.user.id);
    }
    async getMyReferralLink(req) {
        const link = await this.referralsService.getMyReferralLink(req.user.id);
        return { referralLink: link };
    }
    async getMyValidationStatus(req) {
        const referral = await this.validationPipelineService.getActiveReferralForUser(req.user.id);
        if (!referral) {
            return { active: false, validations: [] };
        }
        await this.validationPipelineService.runValidation(referral.id);
        const validations = await this.validationPipelineService.getValidationStatus(referral.id);
        return {
            active: true,
            referralId: referral.id,
            deadline: referral.validationDeadline,
            validations,
        };
    }
};
exports.ReferralsController = ReferralsController;
__decorate([
    (0, common_1.Post)("track"),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Ip)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [track_referral_dto_1.TrackReferralDto, String]),
    __metadata("design:returntype", Promise)
], ReferralsController.prototype, "trackReferralClick", null);
__decorate([
    (0, common_1.Get)("my-referrals"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)("page")),
    __param(2, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ReferralsController.prototype, "getMyReferrals", null);
__decorate([
    (0, common_1.Get)("stats"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReferralsController.prototype, "getReferralStats", null);
__decorate([
    (0, common_1.Get)("my-link"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReferralsController.prototype, "getMyReferralLink", null);
__decorate([
    (0, common_1.Get)("validation-status"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReferralsController.prototype, "getMyValidationStatus", null);
exports.ReferralsController = ReferralsController = __decorate([
    (0, swagger_1.ApiTags)("referrals"),
    (0, common_1.Controller)("referrals"),
    __metadata("design:paramtypes", [referrals_service_1.ReferralsService,
        validation_pipeline_service_1.ValidationPipelineService])
], ReferralsController);
//# sourceMappingURL=referrals.controller.js.map