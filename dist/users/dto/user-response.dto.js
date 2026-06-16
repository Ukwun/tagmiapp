"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TalentSearchResponseDto = exports.SuggestedUserResponseDto = exports.UserSearchResponseDto = exports.MessageResponseDto = exports.CoverUploadResponseDto = exports.AvatarUploadResponseDto = exports.UserProfileResponseDto = void 0;
class UserProfileResponseDto {
    static from(user, isOwnProfile, settings) {
        const response = {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            coverImageUrl: user.coverImageUrl,
            bio: user.bio,
            interests: user.interests,
            gender: user.gender || undefined,
            dateOfBirth: user.dateOfBirth || undefined,
            location: user.location || undefined,
            role: user.role,
            isVerified: user.isVerified,
            isActive: user.isActive,
            followersCount: user.followersCount,
            followingCount: user.followingCount,
            postCount: user.postCount,
            createdAt: user.createdAt,
        };
        if (isOwnProfile) {
            response.email = user.email;
        }
        if (settings) {
            response.privacy = {
                profileVisible: settings.profileVisible,
                showLocation: settings.showLocation,
                showRates: settings.showRates,
            };
            response.isOwnProfile = isOwnProfile;
        }
        return response;
    }
    static fromSafe(user) {
        return {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            coverImageUrl: user.coverImageUrl,
            bio: user.bio,
            interests: user.interests,
            gender: user.gender || undefined,
            dateOfBirth: user.dateOfBirth || undefined,
            location: user.location || undefined,
            role: user.role,
            isVerified: user.isVerified,
            isActive: user.isActive,
            followersCount: user.followersCount,
            followingCount: user.followingCount,
            postCount: user.postCount,
            createdAt: user.createdAt,
        };
    }
}
exports.UserProfileResponseDto = UserProfileResponseDto;
class AvatarUploadResponseDto {
}
exports.AvatarUploadResponseDto = AvatarUploadResponseDto;
class CoverUploadResponseDto {
}
exports.CoverUploadResponseDto = CoverUploadResponseDto;
class MessageResponseDto {
}
exports.MessageResponseDto = MessageResponseDto;
class UserSearchResponseDto {
}
exports.UserSearchResponseDto = UserSearchResponseDto;
class SuggestedUserResponseDto {
}
exports.SuggestedUserResponseDto = SuggestedUserResponseDto;
class TalentSearchResponseDto {
}
exports.TalentSearchResponseDto = TalentSearchResponseDto;
//# sourceMappingURL=user-response.dto.js.map