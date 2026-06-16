export declare class UserDataDto {
    id: string;
    email: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    coverUrl?: string;
    bio?: string;
    websiteUrl?: string;
    gender?: string;
    dateOfBirth?: Date;
    location?: string;
    interests?: string[];
    role: string;
    isVerified: boolean;
    isActive: boolean;
    createdAt: Date;
    isSuperAdmin?: boolean;
    static from(user: any, isSuperAdmin?: boolean): UserDataDto;
}
export declare class AuthTokenResponseDto {
    token: string;
    user: UserDataDto;
    static from(token: string, user: any, isSuperAdmin?: boolean): AuthTokenResponseDto;
}
export declare class OtpVerificationResponseDto {
    verified: boolean;
}
export declare class MessageResponseDto {
    message: string;
}
export declare class UsernameAvailabilityResponseDto {
    username: string;
    available: boolean;
}
