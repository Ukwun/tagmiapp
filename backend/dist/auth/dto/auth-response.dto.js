"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsernameAvailabilityResponseDto = exports.MessageResponseDto = exports.OtpVerificationResponseDto = exports.AuthTokenResponseDto = exports.UserDataDto = void 0;
class UserDataDto {
    static from(user, isSuperAdmin = false) {
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            coverUrl: user.coverImageUrl || user.coverUrl,
            bio: user.bio,
            websiteUrl: user.websiteUrl,
            gender: user.gender || undefined,
            dateOfBirth: user.dateOfBirth || undefined,
            location: user.location || undefined,
            interests: user.interests,
            role: user.role,
            isVerified: user.isVerified,
            isActive: user.isActive,
            createdAt: user.createdAt,
            isSuperAdmin,
        };
    }
}
exports.UserDataDto = UserDataDto;
class AuthTokenResponseDto {
    static from(token, user, isSuperAdmin = false) {
        return {
            token,
            user: UserDataDto.from(user, isSuperAdmin),
        };
    }
}
exports.AuthTokenResponseDto = AuthTokenResponseDto;
class OtpVerificationResponseDto {
}
exports.OtpVerificationResponseDto = OtpVerificationResponseDto;
class MessageResponseDto {
}
exports.MessageResponseDto = MessageResponseDto;
class UsernameAvailabilityResponseDto {
}
exports.UsernameAvailabilityResponseDto = UsernameAvailabilityResponseDto;
//# sourceMappingURL=auth-response.dto.js.map