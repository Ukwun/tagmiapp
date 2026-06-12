import { ReferralsService } from "../../referrals/referrals.service";
import { FraudDetectionService } from "../../referrals/services/fraud-detection.service";
import { ReferralStatus } from "../../referrals/entities/referral.entity";
import { FraudFlagStatus } from "../../referrals/entities/fraud-flag.entity";
export declare class AdminReferralsController {
    private readonly referralsService;
    private readonly fraudDetectionService;
    constructor(referralsService: ReferralsService, fraudDetectionService: FraudDetectionService);
    getAllReferrals(page?: string, limit?: string, status?: ReferralStatus): Promise<{
        data: import("../../referrals/entities/referral.entity").Referral[];
        total: number;
        page: number;
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
    getAdminStats(): Promise<{
        total: number;
        validated: number;
        pending: number;
        rejected: number;
        expired: number;
        fraudRate: number;
    }>;
    getFraudFlags(page?: string, limit?: string, status?: FraudFlagStatus): Promise<{
        data: import("../../referrals/entities/fraud-flag.entity").FraudFlag[];
        total: number;
        page: number;
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
    getReferralDetail(id: string): Promise<import("../../referrals/entities/referral.entity").Referral>;
    approveReferral(id: string): Promise<import("../../referrals/entities/referral.entity").Referral>;
    rejectReferral(id: string, body: {
        reason: string;
    }): Promise<import("../../referrals/entities/referral.entity").Referral>;
    resolveFraudFlag(id: string, body: {
        status: FraudFlagStatus;
        resolution: string;
    }): Promise<import("../../referrals/entities/fraud-flag.entity").FraudFlag>;
}
