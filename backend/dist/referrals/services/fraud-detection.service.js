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
var FraudDetectionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FraudDetectionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const referral_entity_1 = require("../entities/referral.entity");
const fraud_flag_entity_1 = require("../entities/fraud-flag.entity");
const wallet_service_1 = require("../../wallet/wallet.service");
const referral_repository_1 = require("../repositories/referral.repository");
const device_fingerprint_repository_1 = require("../repositories/device-fingerprint.repository");
const fraud_flag_repository_1 = require("../repositories/fraud-flag.repository");
const user_repository_1 = require("../../users/repositories/user.repository");
const DATACENTER_SUBNETS = [
    "10.", "172.16.", "172.17.", "172.18.", "172.19.",
    "172.20.", "172.21.", "172.22.", "172.23.", "172.24.",
    "172.25.", "172.26.", "172.27.", "172.28.", "172.29.",
    "172.30.", "172.31.", "192.168.",
];
let FraudDetectionService = FraudDetectionService_1 = class FraudDetectionService {
    constructor(referralRepository, deviceFingerprintRepository, fraudFlagRepository, userRepository, walletService) {
        this.referralRepository = referralRepository;
        this.deviceFingerprintRepository = deviceFingerprintRepository;
        this.fraudFlagRepository = fraudFlagRepository;
        this.userRepository = userRepository;
        this.walletService = walletService;
        this.logger = new common_1.Logger(FraudDetectionService_1.name);
    }
    extractIpSubnet(ip) {
        if (!ip)
            return "";
        const parts = ip.split(".");
        if (parts.length === 4) {
            return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
        }
        return ip;
    }
    async analyzeRegistration(referral, fingerprintHash, ip) {
        const flags = [];
        let riskScore = 0;
        if (fingerprintHash) {
            const duplicateResult = await this.checkDuplicateDevice(fingerprintHash, referral.referrerId, referral.id);
            if (duplicateResult) {
                flags.push(duplicateResult);
                riskScore += duplicateResult.severity === fraud_flag_entity_1.FraudFlagSeverity.CRITICAL ? 50 : 25;
            }
        }
        if (ip) {
            const ipResult = await this.checkIpSubnetCluster(ip, referral.referrerId, referral.id);
            if (ipResult) {
                flags.push(ipResult);
                riskScore += ipResult.severity === fraud_flag_entity_1.FraudFlagSeverity.HIGH ? 30 : 15;
            }
        }
        if (ip) {
            const vpnResult = await this.checkVpnProxy(ip, referral.id);
            if (vpnResult) {
                flags.push(vpnResult);
                riskScore += 20;
            }
        }
        const velocityResult = await this.checkVelocity(referral.referrerId, referral.id);
        if (velocityResult) {
            flags.push(velocityResult);
            riskScore += 30;
        }
        if (referral.referredUserId) {
            const circularResult = await this.checkCircularReferral(referral.referrerId, referral.referredUserId, referral.id);
            if (circularResult) {
                flags.push(circularResult);
                riskScore += 50;
            }
        }
        for (const flag of flags) {
            await this.fraudFlagRepository.save(flag);
        }
        const blocked = riskScore >= 80;
        if (blocked) {
            this.logger.warn(`Referral ${referral.id} auto-blocked with risk score ${riskScore}`);
            await this.walletService.freezeWallet(referral.referrerId, `Auto-frozen: high fraud risk score (${riskScore})`);
        }
        return { blocked, riskScore, flags };
    }
    async checkDuplicateDevice(fingerprintHash, referrerId, referralId) {
        const existingFingerprints = await this.deviceFingerprintRepository.find({
            where: { fingerprintHash },
        });
        if (existingFingerprints.length === 0)
            return null;
        const referrerReferrals = await this.referralRepository.find({
            where: { referrerId },
        });
        const referredUserIds = referrerReferrals.map((r) => r.referredUserId).filter(Boolean);
        const duplicateUsers = existingFingerprints.filter((fp) => referredUserIds.includes(fp.userId));
        if (duplicateUsers.length > 0) {
            return this.fraudFlagRepository.create({
                userId: referrerId,
                referralId,
                type: fraud_flag_entity_1.FraudFlagType.DUPLICATE_DEVICE,
                severity: fraud_flag_entity_1.FraudFlagSeverity.CRITICAL,
                status: fraud_flag_entity_1.FraudFlagStatus.OPEN,
                description: `Same device fingerprint found across ${duplicateUsers.length + 1} referred users`,
                evidence: {
                    fingerprintHash,
                    matchingUserIds: duplicateUsers.map((fp) => fp.userId),
                },
            });
        }
        const referrerFingerprint = existingFingerprints.find((fp) => fp.userId === referrerId);
        if (referrerFingerprint) {
            return this.fraudFlagRepository.create({
                userId: referrerId,
                referralId,
                type: fraud_flag_entity_1.FraudFlagType.DUPLICATE_DEVICE,
                severity: fraud_flag_entity_1.FraudFlagSeverity.CRITICAL,
                status: fraud_flag_entity_1.FraudFlagStatus.OPEN,
                description: `Referred user has same device fingerprint as referrer`,
                evidence: { fingerprintHash, referrerId },
            });
        }
        return null;
    }
    async checkIpSubnetCluster(ip, referrerId, referralId) {
        const subnet = this.extractIpSubnet(ip);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentReferrals = await this.referralRepository
            .createQueryBuilder("referral")
            .where("referral.referrerId = :referrerId", { referrerId })
            .andWhere("referral.createdAt > :oneDayAgo", { oneDayAgo })
            .getMany();
        const sameSubnetCount = recentReferrals.filter((r) => {
            const rSubnet = this.extractIpSubnet(r.registrationIp || r.clickIp);
            return rSubnet === subnet;
        }).length;
        if (sameSubnetCount >= 3) {
            return this.fraudFlagRepository.create({
                userId: referrerId,
                referralId,
                type: fraud_flag_entity_1.FraudFlagType.SAME_IP_SUBNET,
                severity: sameSubnetCount >= 5 ? fraud_flag_entity_1.FraudFlagSeverity.HIGH : fraud_flag_entity_1.FraudFlagSeverity.MEDIUM,
                status: fraud_flag_entity_1.FraudFlagStatus.OPEN,
                description: `${sameSubnetCount + 1} referrals from same IP subnet (${subnet}) in 24 hours`,
                evidence: { ip, subnet, count: sameSubnetCount + 1 },
            });
        }
        return null;
    }
    async checkVpnProxy(ip, referralId) {
        const isPrivate = DATACENTER_SUBNETS.some((prefix) => ip.startsWith(prefix));
        if (isPrivate) {
            return this.fraudFlagRepository.create({
                referralId,
                type: fraud_flag_entity_1.FraudFlagType.VPN_PROXY,
                severity: fraud_flag_entity_1.FraudFlagSeverity.MEDIUM,
                status: fraud_flag_entity_1.FraudFlagStatus.OPEN,
                description: `Registration from suspected private/datacenter IP: ${ip}`,
                evidence: { ip },
            });
        }
        return null;
    }
    async checkVelocity(referrerId, referralId) {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const dailyCount = await this.referralRepository.count({
            where: {
                referrerId,
                createdAt: (0, typeorm_1.MoreThan)(oneDayAgo),
                status: referral_entity_1.ReferralStatus.VALIDATING,
            },
        });
        const weeklyCount = await this.referralRepository.count({
            where: {
                referrerId,
                createdAt: (0, typeorm_1.MoreThan)(oneWeekAgo),
                status: referral_entity_1.ReferralStatus.VALIDATING,
            },
        });
        if (dailyCount >= 5) {
            return this.fraudFlagRepository.create({
                userId: referrerId,
                referralId,
                type: fraud_flag_entity_1.FraudFlagType.VELOCITY_EXCEEDED,
                severity: fraud_flag_entity_1.FraudFlagSeverity.HIGH,
                status: fraud_flag_entity_1.FraudFlagStatus.OPEN,
                description: `Referrer exceeded daily limit: ${dailyCount + 1} referrals in 24 hours (max 5)`,
                evidence: { dailyCount: dailyCount + 1, weeklyCount },
            });
        }
        if (weeklyCount >= 20) {
            return this.fraudFlagRepository.create({
                userId: referrerId,
                referralId,
                type: fraud_flag_entity_1.FraudFlagType.VELOCITY_EXCEEDED,
                severity: fraud_flag_entity_1.FraudFlagSeverity.MEDIUM,
                status: fraud_flag_entity_1.FraudFlagStatus.OPEN,
                description: `Referrer exceeded weekly limit: ${weeklyCount + 1} referrals in 7 days (max 20)`,
                evidence: { dailyCount, weeklyCount: weeklyCount + 1 },
            });
        }
        return null;
    }
    async checkCircularReferral(referrerId, referredUserId, referralId) {
        let currentUserId = referrerId;
        const visited = new Set();
        for (let depth = 0; depth < 3; depth++) {
            if (visited.has(currentUserId))
                break;
            visited.add(currentUserId);
            const user = await this.userRepository.findOne({ where: { id: currentUserId } });
            if (!user || !user.referredBy)
                break;
            const parentReferral = await this.referralRepository.findOne({ where: { id: user.referredBy } });
            if (!parentReferral)
                break;
            if (parentReferral.referrerId === referredUserId) {
                return this.fraudFlagRepository.create({
                    userId: referrerId,
                    referralId,
                    type: fraud_flag_entity_1.FraudFlagType.CIRCULAR_REFERRAL,
                    severity: fraud_flag_entity_1.FraudFlagSeverity.CRITICAL,
                    status: fraud_flag_entity_1.FraudFlagStatus.OPEN,
                    description: `Circular referral detected at depth ${depth + 1}`,
                    evidence: { referrerId, referredUserId, depth: depth + 1, chain: Array.from(visited) },
                });
            }
            currentUserId = parentReferral.referrerId;
        }
        return null;
    }
    async saveDeviceFingerprint(userId, fingerprintHash, ip, components, userAgent) {
        const fingerprint = this.deviceFingerprintRepository.create({
            userId,
            fingerprintHash,
            ip,
            ipSubnet: this.extractIpSubnet(ip),
            components,
            userAgent,
            isVpn: false,
            isProxy: false,
            isDatacenter: DATACENTER_SUBNETS.some((prefix) => ip?.startsWith(prefix)),
        });
        return this.deviceFingerprintRepository.save(fingerprint);
    }
    async getFraudFlags(page = 1, limit = 20, status) {
        const where = {};
        if (status)
            where.status = status;
        const [flags, total] = await this.fraudFlagRepository.findAndCount({
            where,
            relations: ["user", "referral"],
            order: { createdAt: "DESC" },
            take: limit,
            skip: (page - 1) * limit,
        });
        return { data: flags, total, page, limit, hasNext: page * limit < total, hasPrev: page > 1 };
    }
    async resolveFraudFlag(flagId, status, resolution) {
        const flag = await this.fraudFlagRepository.findOne({ where: { id: flagId } });
        if (!flag)
            throw new Error("Fraud flag not found");
        flag.status = status;
        flag.resolution = resolution;
        return this.fraudFlagRepository.save(flag);
    }
};
exports.FraudDetectionService = FraudDetectionService;
exports.FraudDetectionService = FraudDetectionService = FraudDetectionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [referral_repository_1.ReferralRepository,
        device_fingerprint_repository_1.DeviceFingerprintRepository,
        fraud_flag_repository_1.FraudFlagRepository,
        user_repository_1.UserRepository,
        wallet_service_1.WalletService])
], FraudDetectionService);
//# sourceMappingURL=fraud-detection.service.js.map