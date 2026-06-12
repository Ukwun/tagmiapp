import { User } from "../../users/entities/user.entity";
import { ReferralValidation } from "./referral-validation.entity";
export declare enum ReferralStatus {
    CLICKED = "clicked",
    REGISTERED = "registered",
    VALIDATING = "validating",
    VALIDATED = "validated",
    CREDITED = "credited",
    REJECTED = "rejected",
    EXPIRED = "expired"
}
export declare class Referral {
    id: string;
    referrerId: string;
    referredUserId: string;
    referralCode: string;
    status: ReferralStatus;
    creditsAwarded: number;
    clickIp: string;
    registrationIp: string;
    deviceFingerprintHash: string;
    userAgent: string;
    validationDeadline: Date;
    rejectionReason: string;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    referrer: User;
    referredUser: User;
    validations: ReferralValidation[];
}
