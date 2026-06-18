import { ReferralsService } from "./referrals.service";
import { ValidationPipelineService } from "./services/validation-pipeline.service";
import { TrackReferralDto } from "./dto/track-referral.dto";
export declare class ReferralsController {
    private readonly referralsService;
    private readonly validationPipelineService;
    constructor(referralsService: ReferralsService, validationPipelineService: ValidationPipelineService);
    trackReferralClick(dto: TrackReferralDto, ip: string): Promise<import("./entities/referral.entity").Referral>;
    getMyReferrals(req: any, page?: string, limit?: string): Promise<{
        data: import("./entities/referral.entity").Referral[];
        total: number;
        page: number;
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
    getReferralStats(req: any): Promise<{
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
    getMyReferralLink(req: any): Promise<{
        referralLink: string;
    }>;
    getMyValidationStatus(req: any): Promise<{
        active: boolean;
        validations: any[];
        referralId?: undefined;
        deadline?: undefined;
    } | {
        active: boolean;
        referralId: string;
        deadline: Date;
        validations: import("./entities/referral-validation.entity").ReferralValidation[];
    }>;
}
