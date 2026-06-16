/**
 * User Response DTOs
 *
 * Shapes user data for API responses. Strips sensitive fields like passwordHash,
 * phoneHash, and applies privacy rules based on user settings.
 */
import { User } from "../entities/user.entity"
import { UserSettings } from "../entities/user-settings.entity"

export class UserProfileResponseDto {
  id: string
  email?: string
  username: string
  displayName: string
  avatarUrl?: string
  coverImageUrl?: string
  bio?: string
  interests?: string[]
  gender?: string
  dateOfBirth?: Date
  location?: string
  role: string
  isVerified: boolean
  isActive: boolean
  followersCount: number
  followingCount: number
  postCount: number
  createdAt: Date
  privacy?: {
    profileVisible: boolean
    showLocation: boolean
    showRates: boolean
  }
  isOwnProfile?: boolean

  static from(user: User, isOwnProfile: boolean, settings?: UserSettings): UserProfileResponseDto {
    const response: UserProfileResponseDto = {
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
    }

    // Only include email for own profile
    if (isOwnProfile) {
      response.email = user.email
    }

    // Include privacy settings if provided
    if (settings) {
      response.privacy = {
        profileVisible: settings.profileVisible,
        showLocation: settings.showLocation,
        showRates: settings.showRates,
      }
      response.isOwnProfile = isOwnProfile
    }

    return response
  }

  static fromSafe(user: User): Omit<UserProfileResponseDto, 'email'> {
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
    }
  }
}

export class AvatarUploadResponseDto {
  avatarUrl: string
}

export class CoverUploadResponseDto {
  coverImageUrl: string
}

export class MessageResponseDto {
  message: string
}

export class UserSearchResponseDto {
  id: string
  username: string
  displayName: string
  avatarUrl?: string
  isVerified: boolean
}

export class SuggestedUserResponseDto {
  id: string
  username: string
  displayName: string
  avatarUrl?: string
  isVerified: boolean
  bio?: string
  followersCount: number
}

export class TalentSearchResponseDto {
  data: any[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}
