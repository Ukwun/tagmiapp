/**
 * Auth Response DTOs
 *
 * Defines the exact shape of responses from auth endpoints.
 * These DTOs whitelist only the fields that should reach the client.
 *
 * Never return raw User entities — always transform through these DTOs.
 * This prevents leaking sensitive fields like passwordHash, internal flags, etc.
 *
 * Used by: AuthController, AuthService
 */

/**
 * User data included in auth responses
 */
export class UserDataDto {
  id: string
  email: string
  username: string
  displayName: string
  avatarUrl?: string
  coverUrl?: string
  bio?: string
  websiteUrl?: string
  gender?: string
  dateOfBirth?: Date
  location?: string
  interests?: string[]
  role: string
  isVerified: boolean
  isActive: boolean
  createdAt: Date
  isSuperAdmin?: boolean

  /**
   * Transforms a raw User entity into a safe UserDataDto
   */
  static from(user: any, isSuperAdmin = false): UserDataDto {
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
    }
  }
}

/**
 * Response for successful login or registration
 */
export class AuthTokenResponseDto {
  token: string
  user: UserDataDto

  static from(token: string, user: any, isSuperAdmin = false): AuthTokenResponseDto {
    return {
      token,
      user: UserDataDto.from(user, isSuperAdmin),
    }
  }
}

/**
 * Response for OTP verification
 */
export class OtpVerificationResponseDto {
  verified: boolean
}

/**
 * Response for message-only operations (OTP sent, password reset, etc.)
 */
export class MessageResponseDto {
  message: string
}

/**
 * Response for username availability check
 */
export class UsernameAvailabilityResponseDto {
  username: string
  available: boolean
}
