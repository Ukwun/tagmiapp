import { Referral, ReferralStatus } from "./entities/referral.entity";
import { FraudDetectionService } from "./services/fraud-detection.service";
import { ValidationPipelineService } from "./services/validation-pipeline.service";
import { WalletService } from "../wallet/wallet.service";
import { ReferralRepository } from "./repositories/referral.repository";
import { UserRepository } from "../users/repositories/user.repository";
export declare class ReferralsService {
    private referralRepository;
    private userRepository;
    private fraudDetectionService;
    private validationPipelineService;
    private walletService;
    private readonly logger;
    constructor(referralRepository: ReferralRepository, userRepository: UserRepository, fraudDetectionService: FraudDetectionService, validationPipelineService: ValidationPipelineService, walletService: WalletService);
    trackReferralClick(referralCode: string, ip: string, fingerprint?: string, userAgent?: string): Promise<Referral>;
    linkReferralToUser(referralCode: string, userId: string, ip: string, fingerprint?: string): Promise<Referral>;
    getMyReferrals(userId: string, page?: number, limit?: number): Promise<{
        data: Referral[];
        total: number;
        page: number;
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
    getReferralStats(userId: string): Promise<{
        totalReferred: number;
        validated: number;
        pending: number;
        rejected: number;
        expired: number;
        level: number;
        validReferralCount: number;
        nextLevelAt: number;
        creditsEarned: number;
        referralLink: string;
    }>;
    getMyReferralLink(userId: string): Promise<string>;
    getAllReferrals(page?: number, limit?: number, status?: ReferralStatus): Promise<{
        data: Referral[];
        total: number;
        page: number;
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
    getReferralDetail(referralId: string): Promise<Referral>;
    adminApproveReferral(referralId: string): Promise<Referral>;
    adminRejectReferral(referralId: string, reason: string): Promise<Referral>;
    getAdminStats(): Promise<{
        total: number;
        validated: number;
        pending: number;
        rejected: number;
        expired: number;
        fraudRate: number;
    }>;
}
