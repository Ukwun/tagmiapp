import { Referral } from "../entities/referral.entity";
import { ReferralValidation } from "../entities/referral-validation.entity";
import { WalletService } from "../../wallet/wallet.service";
import { ReferralRepository } from "../repositories/referral.repository";
import { ReferralValidationRepository } from "../repositories/referral-validation.repository";
import { OtpRepository } from "../../auth/repositories/otp.repository";
import { UserRepository } from "../../users/repositories/user.repository";
import { FollowRepository } from "../../follows/repositories/follow.repository";
import { ContentRepository } from "../../content/repositories/content.repository";
export declare class ValidationPipelineService {
    private referralRepository;
    private validationRepository;
    private emailOtpRepository;
    private userRepository;
    private followRepository;
    private contentRepository;
    private walletService;
    private readonly logger;
    constructor(referralRepository: ReferralRepository, validationRepository: ReferralValidationRepository, emailOtpRepository: OtpRepository, userRepository: UserRepository, followRepository: FollowRepository, contentRepository: ContentRepository, walletService: WalletService);
    getActiveReferralForUser(userId: string): Promise<Referral | null>;
    runValidation(referralId: string): Promise<{
        allPassed: boolean;
        results: Record<string, boolean>;
    }>;
    private upsertValidation;
    checkEmailVerified(userId: string, referralId: string): Promise<boolean>;
    checkProfileCompleted(userId: string, referralId: string): Promise<boolean>;
    checkFollowedUsers(userId: string, referralId: string): Promise<boolean>;
    checkCreatedContent(userId: string, referralId: string): Promise<boolean>;
    finalizeValidation(referralId: string): Promise<void>;
    expireStaleReferrals(): Promise<void>;
    getValidationStatus(referralId: string): Promise<ReferralValidation[]>;
}
