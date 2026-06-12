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
var ValidationPipelineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationPipelineService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const schedule_1 = require("@nestjs/schedule");
const referral_entity_1 = require("../entities/referral.entity");
const referral_validation_entity_1 = require("../entities/referral-validation.entity");
const wallet_service_1 = require("../../wallet/wallet.service");
const referral_repository_1 = require("../repositories/referral.repository");
const referral_validation_repository_1 = require("../repositories/referral-validation.repository");
const otp_repository_1 = require("../../auth/repositories/otp.repository");
const user_repository_1 = require("../../users/repositories/user.repository");
const follow_repository_1 = require("../../follows/repositories/follow.repository");
const content_repository_1 = require("../../content/repositories/content.repository");
let ValidationPipelineService = ValidationPipelineService_1 = class ValidationPipelineService {
    constructor(referralRepository, validationRepository, emailOtpRepository, userRepository, followRepository, contentRepository, walletService) {
        this.referralRepository = referralRepository;
        this.validationRepository = validationRepository;
        this.emailOtpRepository = emailOtpRepository;
        this.userRepository = userRepository;
        this.followRepository = followRepository;
        this.contentRepository = contentRepository;
        this.walletService = walletService;
        this.logger = new common_1.Logger(ValidationPipelineService_1.name);
    }
    async getActiveReferralForUser(userId) {
        return this.referralRepository.findOne({
            where: {
                referredUserId: userId,
                status: referral_entity_1.ReferralStatus.VALIDATING,
            },
        });
    }
    async runValidation(referralId) {
        const referral = await this.referralRepository.findOne({ where: { id: referralId } });
        if (!referral || referral.status !== referral_entity_1.ReferralStatus.VALIDATING) {
            return { allPassed: false, results: {} };
        }
        const userId = referral.referredUserId;
        const results = {};
        results[referral_validation_entity_1.ValidationCheckpoint.EMAIL_VERIFIED] = await this.checkEmailVerified(userId, referralId);
        results[referral_validation_entity_1.ValidationCheckpoint.PROFILE_COMPLETED] = await this.checkProfileCompleted(userId, referralId);
        results[referral_validation_entity_1.ValidationCheckpoint.FOLLOWED_USERS] = await this.checkFollowedUsers(userId, referralId);
        results[referral_validation_entity_1.ValidationCheckpoint.CREATED_CONTENT] = await this.checkCreatedContent(userId, referralId);
        const allPassed = Object.values(results).every((v) => v);
        if (allPassed) {
            await this.finalizeValidation(referralId);
        }
        return { allPassed, results };
    }
    async upsertValidation(referralId, checkpoint, passed, evidence) {
        let validation = await this.validationRepository.findOne({
            where: { referralId, checkpoint },
        });
        if (validation) {
            validation.passed = passed;
            validation.evidence = evidence;
        }
        else {
            validation = this.validationRepository.create({
                referralId,
                checkpoint,
                passed,
                evidence,
            });
        }
        await this.validationRepository.save(validation);
    }
    async checkEmailVerified(userId, referralId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            await this.upsertValidation(referralId, referral_validation_entity_1.ValidationCheckpoint.EMAIL_VERIFIED, false, {
                verified: false,
                reason: "User not found",
            });
            return false;
        }
        const emailOtp = await this.emailOtpRepository.findOne({
            where: { email: user.email.toLowerCase().trim(), verified: true },
            order: { createdAt: "DESC" },
        });
        const passed = !!emailOtp;
        await this.upsertValidation(referralId, referral_validation_entity_1.ValidationCheckpoint.EMAIL_VERIFIED, passed, {
            verified: passed,
            email: user.email,
        });
        return passed;
    }
    async checkProfileCompleted(userId, referralId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user)
            return false;
        const hasAvatar = !!user.avatarUrl && user.avatarUrl.length > 0;
        const hasBio = !!user.bio && user.bio.trim().length > 0;
        const hasInterests = !!user.interests && user.interests.length >= 3;
        const passed = hasAvatar && hasBio && hasInterests;
        this.logger.log(`Profile check for user ${userId}: avatar=${hasAvatar} (${user.avatarUrl?.substring(0, 50)}), bio=${hasBio} (len=${user.bio?.trim().length || 0}), interests=${hasInterests} (count=${user.interests?.length || 0}) → ${passed}`);
        await this.upsertValidation(referralId, referral_validation_entity_1.ValidationCheckpoint.PROFILE_COMPLETED, passed, {
            hasAvatar,
            avatarUrl: user.avatarUrl || null,
            hasBio,
            bioLength: user.bio?.trim().length || 0,
            hasInterests,
            interestCount: user.interests?.length || 0,
        });
        return passed;
    }
    async checkFollowedUsers(userId, referralId) {
        const followCount = await this.followRepository.count({
            where: { followerId: userId },
        });
        const passed = followCount >= 2;
        await this.upsertValidation(referralId, referral_validation_entity_1.ValidationCheckpoint.FOLLOWED_USERS, passed, {
            followCount,
            required: 2,
        });
        return passed;
    }
    async checkCreatedContent(userId, referralId) {
        const result = await this.contentRepository
            .createQueryBuilder("content")
            .select("COUNT(DISTINCT content.postId)", "postCount")
            .where("content.userId = :userId", { userId })
            .andWhere("content.isActive = :isActive", { isActive: true })
            .getRawOne();
        const postCount = parseInt(result?.postCount || "0", 10);
        const passed = postCount >= 1;
        await this.upsertValidation(referralId, referral_validation_entity_1.ValidationCheckpoint.CREATED_CONTENT, passed, {
            postCount,
            required: 1,
        });
        return passed;
    }
    async finalizeValidation(referralId) {
        const referral = await this.referralRepository.findOne({
            where: { id: referralId },
            relations: ["referrer"],
        });
        if (!referral || referral.status !== referral_entity_1.ReferralStatus.VALIDATING)
            return;
        referral.status = referral_entity_1.ReferralStatus.VALIDATED;
        await this.referralRepository.save(referral);
        const referrer = await this.userRepository.findOne({ where: { id: referral.referrerId } });
        if (!referrer)
            return;
        const credits = referrer.referralLevel >= 2 ? 7 : 3;
        referral.creditsAwarded = credits;
        referral.status = referral_entity_1.ReferralStatus.CREDITED;
        await this.referralRepository.save(referral);
        await this.walletService.approvePending(referral.referrerId, credits, referralId);
        await this.walletService.moveToWithdrawable(referral.referrerId, credits);
        referrer.validReferralCount = (referrer.validReferralCount || 0) + 1;
        if (referrer.validReferralCount >= 50 && referrer.referralLevel < 2) {
            referrer.referralLevel = 2;
        }
        await this.userRepository.save(referrer);
        this.logger.log(`Referral ${referralId} validated. ${credits} credits awarded to ${referrer.username} (level ${referrer.referralLevel})`);
    }
    async expireStaleReferrals() {
        const now = new Date();
        const staleReferrals = await this.referralRepository.find({
            where: {
                status: referral_entity_1.ReferralStatus.VALIDATING,
                validationDeadline: (0, typeorm_1.LessThan)(now),
            },
        });
        for (const referral of staleReferrals) {
            referral.status = referral_entity_1.ReferralStatus.EXPIRED;
            referral.rejectionReason = "Validation deadline expired (1 year)";
            await this.referralRepository.save(referral);
            const referrer = await this.userRepository.findOne({ where: { id: referral.referrerId } });
            if (referrer) {
                const credits = referrer.referralLevel >= 2 ? 10 : 5;
                await this.walletService.reverseCredits(referral.referrerId, credits, referral.id, "Referral validation expired");
            }
            this.logger.log(`Referral ${referral.id} expired`);
        }
        if (staleReferrals.length > 0) {
            this.logger.log(`Expired ${staleReferrals.length} stale referrals`);
        }
    }
    async getValidationStatus(referralId) {
        return this.validationRepository.find({
            where: { referralId },
            order: { checkpoint: "ASC" },
        });
    }
};
exports.ValidationPipelineService = ValidationPipelineService;
__decorate([
    (0, schedule_1.Cron)("0 * * * *"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ValidationPipelineService.prototype, "expireStaleReferrals", null);
exports.ValidationPipelineService = ValidationPipelineService = ValidationPipelineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [referral_repository_1.ReferralRepository,
        referral_validation_repository_1.ReferralValidationRepository,
        otp_repository_1.OtpRepository,
        user_repository_1.UserRepository,
        follow_repository_1.FollowRepository,
        content_repository_1.ContentRepository,
        wallet_service_1.WalletService])
], ValidationPipelineService);
//# sourceMappingURL=validation-pipeline.service.js.map