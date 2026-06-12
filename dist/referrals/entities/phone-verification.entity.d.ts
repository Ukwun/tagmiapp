export declare class PhoneVerification {
    id: string;
    userId: string;
    phoneHash: string;
    verified: boolean;
    otpHash: string;
    otpExpiresAt: Date;
    attemptCount: number;
    createdAt: Date;
}
