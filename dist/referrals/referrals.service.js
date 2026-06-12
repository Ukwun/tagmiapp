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
var ReferralsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferralsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const referral_entity_1 = require("./entities/referral.entity");
const fraud_detection_service_1 = require("./services/fraud-detection.service");
const validation_pipeline_service_1 = require("./services/validation-pipeline.service");
const wallet_service_1 = require("../wallet/wallet.service");
const referral_repository_1 = require("./repositories/referral.repository");
const user_repository_1 = require("../users/repositories/user.repository");
let ReferralsService = ReferralsService_1 = class ReferralsService {
    constructor(referralRepository, userRepository, fraudDetectionService, validationPipelineService, walletService) {
        this.referralRepository = referralRepository;
        this.userRepository = userRepository;
        this.fraudDetectionService = fraudDetectionService;
        this.validationPipelineService = validationPipelineService;
        this.walletService = walletService;
        this.logger = new common_1.Logger(ReferralsService_1.name);
    }
    async trackReferralClick(referralCode, ip, fingerprint, userAgent) {
        const code = referralCode.toLowerCase().trim();
        const referrer = await this.userRepository.findOne({
            where: { username: (0, typeorm_1.ILike)(code) },
        });
        if (!referrer) {
            throw new common_1.BadRequestException("Invalid referral code");
        }
        const referral = this.referralRepository.create({
            referrerId: referrer.id,
            referralCode: code,
            status: referral_entity_1.ReferralStatus.CLICKED,
            clickIp: ip,
            deviceFingerprintHash: fingerprint,
            userAgent,
        });
        return this.referralRepository.save(referral);
    }
    async linkReferralToUser(referralCode, userId, ip, fingerprint) {
        const code = referralCode.toLowerCase().trim();
        const referrer = await this.userRepository.findOne({
            where: { username: (0, typeorm_1.ILike)(code) },
        });
        if (!referrer) {
            throw new common_1.BadRequestException("Invalid referral code");
        }
        if (referrer.id === userId) {
            throw new common_1.BadRequestException("Cannot refer yourself");
        }
        const existingReferral = await this.referralRepository.findOne({
            where: { referredUserId: userId },
        });
        if (existingReferral) {
            throw new common_1.BadRequestException("User already has a referral");
        }
        let referral = await this.referralRepository.findOne({
            where: {
                referralCode: code,
                status: referral_entity_1.ReferralStatus.CLICKED,
                referredUserId: null,
            },
            order: { createdAt: "DESC" },
        });
        if (!referral) {
            referral = this.referralRepository.create({
                referrerId: referrer.id,
                referralCode: code,
            });
        }
        referral.referredUserId = userId;
        referral.registrationIp = ip;
        referral.deviceFingerprintHash =
            fingerprint || referral.deviceFingerprintHash;
        referral.status = referral_entity_1.ReferralStatus.REGISTERED;
        await this.referralRepository.save(referral);
        if (fingerprint) {
            try {
                await this.fraudDetectionService.saveDeviceFingerprint(userId, fingerprint, ip);
            }
            catch (e) {
                this.logger.warn(`Failed to save device fingerprint: ${e.message}`);
            }
        }
        let riskScore = 0;
        try {
            const fraudResult = await this.fraudDetectionService.analyzeRegistration(referral, fingerprint, ip);
            riskScore = fraudResult.riskScore;
            if (fraudResult.blocked) {
                referral.status = referral_entity_1.ReferralStatus.REJECTED;
                referral.rejectionReason = "Blocked by fraud detection";
                referral.metadata = {
                    riskScore: fraudResult.riskScore,
                    flagIds: fraudResult.flags.map((f) => f.id),
                };
                await this.referralRepository.save(referral);
                return referral;
            }
        }
        catch (e) {
            this.logger.warn(`Fraud detection failed (continuing): ${e.message}`);
        }
        referral.status = referral_entity_1.ReferralStatus.VALIDATING;
        referral.validationDeadline = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        referral.metadata = { riskScore };
        await this.referralRepository.save(referral);
        try {
            await this.userRepository.update(userId, { referredBy: referral.id });
        }
        catch (e) {
            this.logger.warn(`Failed to update referredBy for user ${userId}: ${e.message}`);
        }
        try {
            const credits = referrer.referralLevel >= 2 ? 7 : 3;
            await this.walletService.creditPending(referrer.id, credits, referral.id, ip);
        }
        catch (e) {
            this.logger.warn(`Failed to credit pending for referral ${referral.id}: ${e.message}`);
        }
        try {
            await this.walletService.getOrCreateWallet(userId);
        }
        catch (e) {
            this.logger.warn(`Failed to create wallet for user ${userId}: ${e.message}`);
        }
        this.logger.log(`Referral ${referral.id} linked: ${referrer.username} -> user ${userId}`);
        return referral;
    }
    async getMyReferrals(userId, page = 1, limit = 20) {
        const [referrals, total] = await this.referralRepository.findAndCount({
            where: { referrerId: userId, status: (0, typeorm_1.Not)(referral_entity_1.ReferralStatus.CLICKED) },
            relations: ["referredUser", "validations"],
            order: { createdAt: "DESC" },
            take: limit,
            skip: (page - 1) * limit,
        });
        return {
            data: referrals,
            total,
            page,
            limit,
            hasNext: page * limit < total,
            hasPrev: page > 1,
        };
    }
    async getReferralStats(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        const totalReferred = await this.referralRepository.count({
            where: { referrerId: userId, status: (0, typeorm_1.Not)(referral_entity_1.ReferralStatus.CLICKED) },
        });
        const validated = await this.referralRepository.count({
            where: { referrerId: userId, status: referral_entity_1.ReferralStatus.CREDITED },
        });
        const pending = await this.referralRepository.count({
            where: { referrerId: userId, status: referral_entity_1.ReferralStatus.VALIDATING },
        });
        const rejected = await this.referralRepository.count({
            where: { referrerId: userId, status: referral_entity_1.ReferralStatus.REJECTED },
        });
        const expired = await this.referralRepository.count({
            where: { referrerId: userId, status: referral_entity_1.ReferralStatus.EXPIRED },
        });
        const wallet = await this.walletService.getWallet(userId);
        return {
            totalReferred,
            validated,
            pending,
            rejected,
            expired,
            level: user?.referralLevel || 1,
            validReferralCount: user?.validReferralCount || 0,
            nextLevelAt: 50,
            creditsEarned: Number(wallet.totalEarned),
            referralLink: `${(process.env.CORS_ORIGIN || "https://tagmi.social").split(",")[0]}/register?ref=${user?.username}`,
        };
    }
    async getMyReferralLink(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.BadRequestException("User not found");
        return `${(process.env.CORS_ORIGIN || "https://tagmi.social").split(",")[0]}/register?ref=${user.username}`;
    }
    async getAllReferrals(page = 1, limit = 20, status) {
        const where = {};
        if (status)
            where.status = status;
        const [referrals, total] = await this.referralRepository.findAndCount({
            where,
            relations: ["referrer", "referredUser", "validations"],
            order: { createdAt: "DESC" },
            take: limit,
            skip: (page - 1) * limit,
        });
        return {
            data: referrals,
            total,
            page,
            limit,
            hasNext: page * limit < total,
            hasPrev: page > 1,
        };
    }
    async getReferralDetail(referralId) {
        const referral = await this.referralRepository.findOne({
            where: { id: referralId },
            relations: ["referrer", "referredUser", "validations"],
        });
        if (!referral)
            throw new common_1.BadRequestException("Referral not found");
        return referral;
    }
    async adminApproveReferral(referralId) {
        const referral = await this.referralRepository.findOne({
            where: { id: referralId },
        });
        if (!referral)
            throw new common_1.BadRequestException("Referral not found");
        if (referral.status === referral_entity_1.ReferralStatus.CREDITED) {
            throw new common_1.BadRequestException("Referral already credited");
        }
        referral.status = referral_entity_1.ReferralStatus.VALIDATING;
        await this.referralRepository.save(referral);
        await this.validationPipelineService.finalizeValidation(referralId);
        return this.referralRepository.findOne({ where: { id: referralId } });
    }
    async adminRejectReferral(referralId, reason) {
        const referral = await this.referralRepository.findOne({
            where: { id: referralId },
        });
        if (!referral)
            throw new common_1.BadRequestException("Referral not found");
        const wasValidating = referral.status === referral_entity_1.ReferralStatus.VALIDATING;
        referral.status = referral_entity_1.ReferralStatus.REJECTED;
        referral.rejectionReason = reason;
        if (wasValidating) {
            const referrer = await this.userRepository.findOne({
                where: { id: referral.referrerId },
            });
            if (referrer) {
                const credits = referrer.referralLevel >= 2 ? 10 : 5;
                await this.walletService.reverseCredits(referral.referrerId, credits, referralId, `Admin rejected: ${reason}`);
            }
        }
        return this.referralRepository.save(referral);
    }
    async getAdminStats() {
        const total = await this.referralRepository.count();
        const validated = await this.referralRepository.count({
            where: { status: referral_entity_1.ReferralStatus.CREDITED },
        });
        const pending = await this.referralRepository.count({
            where: { status: referral_entity_1.ReferralStatus.VALIDATING },
        });
        const rejected = await this.referralRepository.count({
            where: { status: referral_entity_1.ReferralStatus.REJECTED },
        });
        const expired = await this.referralRepository.count({
            where: { status: referral_entity_1.ReferralStatus.EXPIRED },
        });
        return {
            total,
            validated,
            pending,
            rejected,
            expired,
            fraudRate: total > 0 ? rejected / total : 0,
        };
    }
};
exports.ReferralsService = ReferralsService;
exports.ReferralsService = ReferralsService = ReferralsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [referral_repository_1.ReferralRepository,
        user_repository_1.UserRepository,
        fraud_detection_service_1.FraudDetectionService,
        validation_pipeline_service_1.ValidationPipelineService,
        wallet_service_1.WalletService])
], ReferralsService);
//# sourceMappingURL=referrals.service.js.map