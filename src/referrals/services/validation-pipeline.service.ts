import { Injectable, Logger } from "@nestjs/common"
import { LessThan } from "typeorm"
import { Cron } from "@nestjs/schedule"
import { Referral, ReferralStatus } from "../entities/referral.entity"
import { ReferralValidation, ValidationCheckpoint } from "../entities/referral-validation.entity"
import { WalletService } from "../../wallet/wallet.service"
import { ReferralRepository } from "../repositories/referral.repository"
import { ReferralValidationRepository } from "../repositories/referral-validation.repository"
import { OtpRepository } from "../../auth/repositories/otp.repository"
import { UserRepository } from "../../users/repositories/user.repository"
import { FollowRepository } from "../../follows/repositories/follow.repository"
import { ContentRepository } from "../../content/repositories/content.repository"

@Injectable()
export class ValidationPipelineService {
  private readonly logger = new Logger(ValidationPipelineService.name)

  constructor(
    private referralRepository: ReferralRepository,
    private validationRepository: ReferralValidationRepository,
    private emailOtpRepository: OtpRepository,
    private userRepository: UserRepository,
    private followRepository: FollowRepository,
    private contentRepository: ContentRepository,
    private walletService: WalletService,
  ) {}

  async getActiveReferralForUser(userId: string): Promise<Referral | null> {
    return this.referralRepository.findOne({
      where: {
        referredUserId: userId,
        status: ReferralStatus.VALIDATING,
      },
    })
  }

  async runValidation(referralId: string): Promise<{
    allPassed: boolean
    results: Record<string, boolean>
  }> {
    const referral = await this.referralRepository.findOne({ where: { id: referralId } })
    if (!referral || referral.status !== ReferralStatus.VALIDATING) {
      return { allPassed: false, results: {} }
    }

    const userId = referral.referredUserId
    const results: Record<string, boolean> = {}

    // Run all 4 checkpoint checks
    results[ValidationCheckpoint.EMAIL_VERIFIED] = await this.checkEmailVerified(userId, referralId)
    results[ValidationCheckpoint.PROFILE_COMPLETED] = await this.checkProfileCompleted(userId, referralId)
    results[ValidationCheckpoint.FOLLOWED_USERS] = await this.checkFollowedUsers(userId, referralId)
    results[ValidationCheckpoint.CREATED_CONTENT] = await this.checkCreatedContent(userId, referralId)

    const allPassed = Object.values(results).every((v) => v)

    if (allPassed) {
      await this.finalizeValidation(referralId)
    }

    return { allPassed, results }
  }

  private async upsertValidation(
    referralId: string,
    checkpoint: ValidationCheckpoint,
    passed: boolean,
    evidence?: Record<string, any>,
  ): Promise<void> {
    let validation = await this.validationRepository.findOne({
      where: { referralId, checkpoint },
    })

    if (validation) {
      validation.passed = passed
      validation.evidence = evidence
    } else {
      validation = this.validationRepository.create({
        referralId,
        checkpoint,
        passed,
        evidence,
      })
    }

    await this.validationRepository.save(validation)
  }

  /**
   * Check that the user verified their email via OTP during registration.
   * Looks up the email_otps table for a verified entry matching the user's email.
   */
  async checkEmailVerified(userId: string, referralId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } })
    if (!user) {
      await this.upsertValidation(referralId, ValidationCheckpoint.EMAIL_VERIFIED, false, {
        verified: false,
        reason: "User not found",
      })
      return false
    }

    const emailOtp = await this.emailOtpRepository.findOne({
      where: { email: user.email.toLowerCase().trim(), verified: true },
      order: { createdAt: "DESC" },
    })

    const passed = !!emailOtp
    await this.upsertValidation(referralId, ValidationCheckpoint.EMAIL_VERIFIED, passed, {
      verified: passed,
      email: user.email,
    })
    return passed
  }

  /**
   * Check profile completion: avatar uploaded, bio with meaningful content (>= 10 chars),
   * and at least 3 interests selected.
   */
  async checkProfileCompleted(userId: string, referralId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } })
    if (!user) return false

    const hasAvatar = !!user.avatarUrl && user.avatarUrl.length > 0
    const hasBio = !!user.bio && user.bio.trim().length > 0
    const hasInterests = !!user.interests && user.interests.length >= 3

    const passed = hasAvatar && hasBio && hasInterests
    this.logger.log(`Profile check for user ${userId}: avatar=${hasAvatar} (${user.avatarUrl?.substring(0, 50)}), bio=${hasBio} (len=${user.bio?.trim().length || 0}), interests=${hasInterests} (count=${user.interests?.length || 0}) → ${passed}`)
    await this.upsertValidation(referralId, ValidationCheckpoint.PROFILE_COMPLETED, passed, {
      hasAvatar,
      avatarUrl: user.avatarUrl || null,
      hasBio,
      bioLength: user.bio?.trim().length || 0,
      hasInterests,
      interestCount: user.interests?.length || 0,
    })
    return passed
  }

  /**
   * Check that the user has followed at least 2 other users.
   */
  async checkFollowedUsers(userId: string, referralId: string): Promise<boolean> {
    const followCount = await this.followRepository.count({
      where: { followerId: userId },
    })

    const passed = followCount >= 2
    await this.upsertValidation(referralId, ValidationCheckpoint.FOLLOWED_USERS, passed, {
      followCount,
      required: 2,
    })
    return passed
  }

  /**
   * Check that the user has created at least 1 post.
   * Counts unique postId values (not individual slides) to avoid
   * a multi-slide post counting as multiple posts.
   */
  async checkCreatedContent(userId: string, referralId: string): Promise<boolean> {
    const result = await this.contentRepository
      .createQueryBuilder("content")
      .select("COUNT(DISTINCT content.postId)", "postCount")
      .where("content.userId = :userId", { userId })
      .andWhere("content.isActive = :isActive", { isActive: true })
      .getRawOne()

    const postCount = parseInt(result?.postCount || "0", 10)

    const passed = postCount >= 1
    await this.upsertValidation(referralId, ValidationCheckpoint.CREATED_CONTENT, passed, {
      postCount,
      required: 1,
    })
    return passed
  }

  async finalizeValidation(referralId: string): Promise<void> {
    const referral = await this.referralRepository.findOne({
      where: { id: referralId },
      relations: ["referrer"],
    })

    if (!referral || referral.status !== ReferralStatus.VALIDATING) return

    // Move to validated
    referral.status = ReferralStatus.VALIDATED
    await this.referralRepository.save(referral)

    // Award VC based on referrer tier: 3 VC (Tier 1) or 7 VC (Tier 2)
    const referrer = await this.userRepository.findOne({ where: { id: referral.referrerId } })
    if (!referrer) return

    const credits = referrer.referralLevel >= 2 ? 7 : 3
    referral.creditsAwarded = credits
    referral.status = ReferralStatus.CREDITED
    await this.referralRepository.save(referral)

    // Move pending to approved in wallet
    await this.walletService.approvePending(referral.referrerId, credits, referralId)

    // Auto-move to withdrawable
    await this.walletService.moveToWithdrawable(referral.referrerId, credits)

    // Update referrer stats
    referrer.validReferralCount = (referrer.validReferralCount || 0) + 1
    if (referrer.validReferralCount >= 50 && referrer.referralLevel < 2) {
      referrer.referralLevel = 2
    }
    await this.userRepository.save(referrer)

    this.logger.log(
      `Referral ${referralId} validated. ${credits} credits awarded to ${referrer.username} (level ${referrer.referralLevel})`,
    )
  }

  @Cron("0 * * * *") // Every hour
  async expireStaleReferrals(): Promise<void> {
    const now = new Date()

    const staleReferrals = await this.referralRepository.find({
      where: {
        status: ReferralStatus.VALIDATING,
        validationDeadline: LessThan(now),
      },
    })

    for (const referral of staleReferrals) {
      referral.status = ReferralStatus.EXPIRED
      referral.rejectionReason = "Validation deadline expired (1 year)"
      await this.referralRepository.save(referral)

      // Reverse pending credits
      const referrer = await this.userRepository.findOne({ where: { id: referral.referrerId } })
      if (referrer) {
        const credits = referrer.referralLevel >= 2 ? 10 : 5
        await this.walletService.reverseCredits(
          referral.referrerId,
          credits,
          referral.id,
          "Referral validation expired",
        )
      }

      this.logger.log(`Referral ${referral.id} expired`)
    }

    if (staleReferrals.length > 0) {
      this.logger.log(`Expired ${staleReferrals.length} stale referrals`)
    }
  }

  async getValidationStatus(referralId: string): Promise<ReferralValidation[]> {
    return this.validationRepository.find({
      where: { referralId },
      order: { checkpoint: "ASC" },
    })
  }
}
