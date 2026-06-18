import { Referral } from "./referral.entity";
export declare enum ValidationCheckpoint {
    EMAIL_VERIFIED = "email_verified",
    PHONE_VERIFIED = "phone_verified",
    PROFILE_COMPLETED = "profile_completed",
    FOLLOWED_USERS = "followed_users",
    CREATED_CONTENT = "created_content",
    SESSION_DAYS = "session_days",
    SESSION_TIME = "session_time"
}
export declare class ReferralValidation {
    id: string;
    referralId: string;
    checkpoint: ValidationCheckpoint;
    passed: boolean;
    evidence: Record<string, any>;
    checkedAt: Date;
    referral: Referral;
}
