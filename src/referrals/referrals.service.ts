import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import { ILike, Not } from "typeorm";
import { Referral, ReferralStatus } from "./entities/referral.entity";
import { FraudDetectionService } from "./services/fraud-detection.service";
import { ValidationPipelineService } from "./services/validation-pipeline.service";
import { WalletService } from "../wallet/wallet.service";
import { ReferralRepository } from "./repositories/referral.repository";
import { UserRepository } from "../users/repositories/user.repository";

@Injectable()
export class ReferralsService {
  private readonly logger = new Logger(ReferralsService.name);

  constructor(
    private referralRepository: ReferralRepository,
    private userRepository: UserRepository,
    private fraudDetectionService: FraudDetectionService,
    private validationPipelineService: ValidationPipelineService,
    private walletService: WalletService,
  ) {}


  async trackReferralClick(
    referralCode: string,
    ip: string,
    fingerprint?: string,
    userAgent?: string,
  ): Promise<Referral> {
    const code = referralCode.toLowerCase().trim();
    // Find the referrer by username (case-insensitive)
    const referrer = await this.userRepository.findOne({
      where: { username: ILike(code) },
    });
    if (!referrer) {
      throw new BadRequestException("Invalid referral code");
    }

    const referral = this.referralRepository.create({
      referrerId: referrer.id,
      referralCode: code,
      status: ReferralStatus.CLICKED,
      clickIp: ip,
      deviceFingerprintHash: fingerprint,
      userAgent,
    });

    return this.referralRepository.save(referral);
  }

  async linkReferralToUser(
    referralCode: string,
    userId: string,
    ip: string,
    fingerprint?: string,
  ): Promise<Referral> {
    const code = referralCode.toLowerCase().trim();
    // Find the referrer (case-insensitive)
    const referrer = await this.userRepository.findOne({
      where: { username: ILike(code) },
    });
    if (!referrer) {
      throw new BadRequestException("Invalid referral code");
    }

    // Can't refer yourself
    if (referrer.id === userId) {
      throw new BadRequestException("Cannot refer yourself");
    }

    // Check if user already has a referral
    const existingReferral = await this.referralRepository.findOne({
      where: { referredUserId: userId },
    });
    if (existingReferral) {
      throw new BadRequestException("User already has a referral");
    }

    // Find the most recent CLICKED referral for this referral code, or create new one
    let referral = await this.referralRepository.findOne({
      where: {
        referralCode: code,
        status: ReferralStatus.CLICKED,
        referredUserId: null as any,
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
    referral.status = ReferralStatus.REGISTERED;
    await this.referralRepository.save(referral);

    // Save device fingerprint
    if (fingerprint) {
      try {
        await this.fraudDetectionService.saveDeviceFingerprint(
          userId,
          fingerprint,
          ip,
        );
      } catch (e: any) {
        this.logger.warn(`Failed to save device fingerprint: ${e.message}`);
      }
    }

    // Run fraud detection (wrapped so referral creation is not blocked by errors)
    let riskScore = 0;
    try {
      const fraudResult = await this.fraudDetectionService.analyzeRegistration(
        referral,
        fingerprint,
        ip,
      );
      riskScore = fraudResult.riskScore;

      if (fraudResult.blocked) {
        referral.status = ReferralStatus.REJECTED;
        referral.rejectionReason = "Blocked by fraud detection";
        referral.metadata = {
          riskScore: fraudResult.riskScore,
          flagIds: fraudResult.flags.map((f) => f.id),
        };
        await this.referralRepository.save(referral);
        return referral;
      }
    } catch (e: any) {
      this.logger.warn(`Fraud detection failed (continuing): ${e.message}`);
    }

    // Move to validating state
    referral.status = ReferralStatus.VALIDATING;
    referral.validationDeadline = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 365 days (1 year)
    referral.metadata = { riskScore };
    await this.referralRepository.save(referral);

    // Update user's referredBy
    try {
      await this.userRepository.update(userId, { referredBy: referral.id });
    } catch (e: any) {
      this.logger.warn(`Failed to update referredBy for user ${userId}: ${e.message}`);
    }

    // Credit pending in referrer's wallet: 3 VC (Tier 1) or 7 VC (Tier 2)
    try {
      const credits = referrer.referralLevel >= 2 ? 7 : 3;
      await this.walletService.creditPending(
        referrer.id,
        credits,
        referral.id,
        ip,
      );
    } catch (e: any) {
      this.logger.warn(`Failed to credit pending for referral ${referral.id}: ${e.message}`);
    }

    // Create wallet for the new user too
    try {
      await this.walletService.getOrCreateWallet(userId);
    } catch (e: any) {
      this.logger.warn(`Failed to create wallet for user ${userId}: ${e.message}`);
    }

    this.logger.log(
      `Referral ${referral.id} linked: ${referrer.username} -> user ${userId}`,
    );
    return referral;
  }

  async getMyReferrals(userId: string, page = 1, limit = 20) {
    // Exclude "clicked" referrals — they have no referred user and are just
    // raw link-click records. Including them breaks pagination because the
    // frontend filters them out, so pages come back nearly empty.
    const [referrals, total] = await this.referralRepository.findAndCount({
      where: { referrerId: userId, status: Not(ReferralStatus.CLICKED) },
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

  async getReferralStats(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    // Exclude "clicked" — those are raw link visits, not actual signups.
    const totalReferred = await this.referralRepository.count({
      where: { referrerId: userId, status: Not(ReferralStatus.CLICKED) },
    });
    const validated = await this.referralRepository.count({
      where: { referrerId: userId, status: ReferralStatus.CREDITED },
    });
    const pending = await this.referralRepository.count({
      where: { referrerId: userId, status: ReferralStatus.VALIDATING },
    });
    const rejected = await this.referralRepository.count({
      where: { referrerId: userId, status: ReferralStatus.REJECTED },
    });
    const expired = await this.referralRepository.count({
      where: { referrerId: userId, status: ReferralStatus.EXPIRED },
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

  async getMyReferralLink(userId: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException("User not found");
    return `${(process.env.CORS_ORIGIN || "https://tagmi.social").split(",")[0]}/register?ref=${user.username}`;
  }

  // Admin methods
  async getAllReferrals(page = 1, limit = 20, status?: ReferralStatus) {
    const where: any = {};
    if (status) where.status = status;

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

  async getReferralDetail(referralId: string): Promise<Referral> {
    const referral = await this.referralRepository.findOne({
      where: { id: referralId },
      relations: ["referrer", "referredUser", "validations"],
    });
    if (!referral) throw new BadRequestException("Referral not found");
    return referral;
  }

  async adminApproveReferral(referralId: string): Promise<Referral> {
    const referral = await this.referralRepository.findOne({
      where: { id: referralId },
    });
    if (!referral) throw new BadRequestException("Referral not found");

    if (referral.status === ReferralStatus.CREDITED) {
      throw new BadRequestException("Referral already credited");
    }

    // Force finalize
    referral.status = ReferralStatus.VALIDATING;
    await this.referralRepository.save(referral);
    await this.validationPipelineService.finalizeValidation(referralId);

    return this.referralRepository.findOne({ where: { id: referralId } });
  }

  async adminRejectReferral(
    referralId: string,
    reason: string,
  ): Promise<Referral> {
    const referral = await this.referralRepository.findOne({
      where: { id: referralId },
    });
    if (!referral) throw new BadRequestException("Referral not found");

    const wasValidating = referral.status === ReferralStatus.VALIDATING;

    referral.status = ReferralStatus.REJECTED;
    referral.rejectionReason = reason;

    if (wasValidating) {
      // Reverse pending credits
      const referrer = await this.userRepository.findOne({
        where: { id: referral.referrerId },
      });
      if (referrer) {
        const credits = referrer.referralLevel >= 2 ? 10 : 5;
        await this.walletService.reverseCredits(
          referral.referrerId,
          credits,
          referralId,
          `Admin rejected: ${reason}`,
        );
      }
    }

    return this.referralRepository.save(referral);
  }

  async getAdminStats() {
    const total = await this.referralRepository.count();
    const validated = await this.referralRepository.count({
      where: { status: ReferralStatus.CREDITED },
    });
    const pending = await this.referralRepository.count({
      where: { status: ReferralStatus.VALIDATING },
    });
    const rejected = await this.referralRepository.count({
      where: { status: ReferralStatus.REJECTED },
    });
    const expired = await this.referralRepository.count({
      where: { status: ReferralStatus.EXPIRED },
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
}
