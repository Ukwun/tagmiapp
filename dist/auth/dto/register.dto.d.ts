export declare class RegisterDto {
    email: string;
    username: string;
    displayName?: string;
    password: string;
    interests?: string[];
    role?: "talent" | "client";
    gender?: string;
    dateOfBirth?: string;
    location?: string;
    referralCode?: string;
    fingerprint?: string;
}
