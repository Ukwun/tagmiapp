/**
 * AuthService
 *
 * Handles user authentication and registration. Verifies credentials,
 * creates new users, and generates JWT tokens.
 *
 * It does NOT send emails — that is OtpService's job.
 * It does NOT guard routes — that is JwtAuthGuard's job.
 * It does NOT store tokens — that is the client's responsibility.
 *
 * Used by: AuthController
 */
import { Injectable, UnauthorizedException, BadRequestException, Inject, Optional, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
import * as bcrypt from "bcryptjs"
import type { RegisterDto } from "./dto/register.dto"
import type { LoginDto } from "./dto/login.dto"
import {
  AuthTokenResponseDto,
  MessageResponseDto,
  OtpVerificationResponseDto,
} from "./dto/auth-response.dto"
import { OtpService } from "./services/otp.service"
import { ReferralsService } from "../referrals/referrals.service"
import { ErrorHandler } from "../common/exceptions/error.handler"
import { ERROR_MESSAGES } from "../common/constants/error-messages.constant"
import { UserRepository } from "../users/repositories/user.repository"
import type { User } from "../users/entities/user.entity"

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private otpService: OtpService,
    private configService: ConfigService,
    @Optional() @Inject(ReferralsService) private referralsService?: ReferralsService,
  ) {}

  async sendEmailOtp(email: string): Promise<MessageResponseDto> {
    return this.otpService.sendEmailOtp(email)
  }

  async verifyEmailOtp(email: string, code: string): Promise<OtpVerificationResponseDto> {
    return this.otpService.verifyEmailOtp(email, code)
  }

  /**
   * Registers a new user account.
   *
   * Email verification required to prevent spam. Passwords hashed with bcrypt (10 rounds).
   * Email/username stored lowercase for case-insensitive lookups.
   * Referral linking is async — won't block registration if it fails.
   */
  async register(registerDto: RegisterDto): Promise<AuthTokenResponseDto> {
    const { email, username, password, displayName, interests, role, gender, dateOfBirth } = registerDto
    const emailLower = email.toLowerCase().trim()
    const usernameLower = username.toLowerCase().trim()

    const emailVerified = await this.otpService.isEmailVerified(emailLower)
    if (!emailVerified) {
      throw new BadRequestException(ERROR_MESSAGES.ACCOUNT_NOT_VERIFIED)
    }

    const existingUser = await this.userRepository.findByEmailOrUsername(emailLower)

    if (existingUser) {
      if (existingUser.email.toLowerCase() === emailLower) {
        ErrorHandler.conflict("User", "email", emailLower)
      }
      ErrorHandler.conflict("User", "username", usernameLower)
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const savedUser = await this.userRepository.create({
      email: emailLower,
      username: usernameLower,
      displayName: displayName || username,
      passwordHash,
      interests: interests || [],
      role: role || "client",
      // Persist gender and DOB collected during registration so the
      // "Complete Your Profile" gate does not trigger for new users.
      ...(gender ? { gender } : {}),
      ...(dateOfBirth ? { dateOfBirth: new Date(dateOfBirth) } : {}),
    })

    // Link referral if provided — log errors but don't fail registration
    if (registerDto.referralCode && this.referralsService) {
      try {
        await this.referralsService.linkReferralToUser(
          registerDto.referralCode,
          savedUser.id,
          "",
          registerDto.fingerprint,
        )
        this.logger.log(`Referral linked for user ${savedUser.id}`)
      } catch (error) {
        this.logger.warn(`Failed to link referral for user ${savedUser.id}: ${(error as any).message}`)
      }
    }

    const payload = { sub: savedUser.id, email: savedUser.email, username: savedUser.username }
    const token = this.jwtService.sign(payload)

    return AuthTokenResponseDto.from(token, savedUser)
  }

  /**
   * Authenticates user and returns JWT token.
   *
   * Accepts email OR username (case-insensitive). Password comparison is timing-safe.
   * Updates lastLogin after verification. Super admin auto-promoted to "manager" role on login.
   */
  async login(loginDto: LoginDto): Promise<AuthTokenResponseDto> {
    const { email, password } = loginDto

    const user = await this.userRepository.findByEmailOrUsernameWithPassword(email)

    if (!user || !user.isActive) {
      ErrorHandler.unauthorized(ERROR_MESSAGES.INVALID_CREDENTIALS)
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    if (!isPasswordValid) {
      ErrorHandler.unauthorized(ERROR_MESSAGES.INVALID_CREDENTIALS)
    }

    await this.userRepository.update(user.id, { lastLogin: new Date() })

    // Auto-promote super admin if configured but not yet manager
    const superAdminEmail = this.configService.get("SUPER_ADMIN_EMAIL", "").toLowerCase().trim()
    const isSuperAdmin = !!superAdminEmail && user.email.toLowerCase() === superAdminEmail
    if (isSuperAdmin && user.role !== "manager") {
      await this.userRepository.update(user.id, { role: "manager" })
      user.role = "manager"
      this.logger.log(`Auto-promoted super-admin ${user.email} to manager`)
    }

    const payload = { sub: user.id, email: user.email, username: user.username, role: user.role }
    const token = this.jwtService.sign(payload)

    return AuthTokenResponseDto.from(token, user, isSuperAdmin)
  }

  /**
   * Validates user credentials for Passport local strategy.
   */
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findByEmailOrUsernameWithPassword(email)

    if (user && user.isActive && (await bcrypt.compare(password, user.passwordHash))) {
      const { passwordHash, ...result } = user
      return result
    }
    return null
  }

  async sendPasswordResetOtp(email: string): Promise<MessageResponseDto> {
    return this.otpService.sendPasswordResetOtp(email)
  }

  /**
   * Resets user password using OTP code.
   *
   * Verifies OTP, finds user, hashes new password, updates database.
   */
  async resetPassword(email: string, code: string, newPassword: string): Promise<MessageResponseDto> {
    const emailLower = email.toLowerCase().trim()

    await this.otpService.verifyEmailOtp(`reset:${emailLower}`, code)

    const user = await this.userRepository.findByEmail(emailLower)

    if (!user || !user.isActive) {
      ErrorHandler.notFound("User")
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)
    await this.userRepository.update(user.id, { passwordHash })

    return { message: "Password reset successfully" }
  }

  /**
   * Checks username availability (case-insensitive).
   */
  async isUsernameAvailable(username: string): Promise<boolean> {
    const existing = await this.userRepository.findByUsernameOptional(username.toLowerCase())
    return !existing
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findByIdOptional(id)
  }
}

