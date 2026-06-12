import { ReferralsService } from "./referrals.service";
import { FraudDetectionService } from "./services/fraud-detection.service";
import { ReferralStatus } from "./entities/referral.entity";
import { FraudFlagStatus } from "./entities/fraud-flag.entity";
export declare class AdminReferralsController {
    private readonly referralsService;
    private readonly fraudDetectionService;
    constructor(referralsService: ReferralsService, fraudDetectionService: FraudDetectionService);
    getAllReferrals(page?: string, limit?: string, status?: ReferralStatus): Promise<{
        data: import("./entities/referral.entity").Referral[];
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
    approveReferral(id: string): Promise<import("./entities/referral.entity").Referral>;
    rejectReferral(id: string, body: {
        reason: string;
    }): Promise<import("./entities/referral.entity").Referral>;
    getFraudFlags(page?: string, limit?: string, status?: FraudFlagStatus): Promise<{
        data: import("./entities/fraud-flag.entity").FraudFlag[];
        total: number;
        page: number;
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
    resolveFraudFlag(id: string, body: {
        status: FraudFlagStatus;
        resolution: string;
    }): Promise<import("./entities/fraud-flag.entity").FraudFlag>;
}
