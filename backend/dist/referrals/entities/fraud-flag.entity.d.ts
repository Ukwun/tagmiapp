import { User } from "../../users/entities/user.entity";
import { Referral } from "./referral.entity";
export declare enum FraudFlagType {
    DUPLICATE_DEVICE = "duplicate_device",
    SAME_IP_SUBNET = "same_ip_subnet",
    VPN_PROXY = "vpn_proxy",
    RAPID_SIGNUPS = "rapid_signups",
    SIMILAR_CREDENTIALS = "similar_credentials",
    LOW_SESSION_QUALITY = "low_session_quality",
    VELOCITY_EXCEEDED = "velocity_exceeded",
    CIRCULAR_REFERRAL = "circular_referral",
    PHONE_REUSE = "phone_reuse",
    COLLUSION_PATTERN = "collusion_pattern"
}
export declare enum FraudFlagSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare enum FraudFlagStatus {
    OPEN = "open",
    INVESTIGATING = "investigating",
    CONFIRMED = "confirmed",
    DISMISSED = "dismissed"
}
export declare class FraudFlag {
    id: string;
    userId: string;
    referralId: string;
    type: FraudFlagType;
    severity: FraudFlagSeverity;
    status: FraudFlagStatus;
    description: string;
    evidence: Record<string, any>;
    resolution: string;
    createdAt: Date;
    user: User;
    referral: Referral;
}
