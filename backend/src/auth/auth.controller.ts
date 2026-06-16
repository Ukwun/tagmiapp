/**
 * AuthController
 *
 * Handles all authentication HTTP requests: registration, login, OTP verification,
 * password resets, and username availability checks.
 *
 * This controller has zero business logic — it just validates input via DTOs
 * and passes requests to AuthService.
 *
 * It does NOT authenticate users — that is JwtAuthGuard's job.
 * It does NOT handle OTP logic — that is OtpService's job.
 * It just routes HTTP requests to the right service methods.
 *
 * Rate limiting is applied to prevent abuse:
 * - OTP sending: 1 request per 2 minutes
 * - OTP verification: 10 requests per minute
 * - Password reset: 1 request per 2 minutes
 * - Username check: 20 requests per minute
 *
 * Used by: Frontend auth flows
 */
import { Controller, Post, UseGuards, Request, Get, Body, Query } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger"
import { ConfigService } from "@nestjs/config"
import { Throttle, ThrottlerGuard } from "@nestjs/throttler"
import { AuthService } from "./auth.service"
import {
  RegisterDto,
  LoginDto,
  SendOtpDto,
  VerifyOtpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  CheckUsernameDto,
  AuthTokenResponseDto,
  MessageResponseDto,
  OtpVerificationResponseDto,
  UsernameAvailabilityResponseDto,
  UserDataDto,
} from "./dto"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  /**
   * Sends an email verification OTP to the provided email.
   *
   * Rate limited to prevent spam and email abuse.
   */
  @Post("send-otp")
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 120000, limit: 1 } })
  @ApiOperation({ summary: "Send email verification OTP" })
  @ApiResponse({ status: 200, description: "OTP sent successfully" })
  async sendOtp(@Body() dto: SendOtpDto): Promise<MessageResponseDto> {
    return this.authService.sendEmailOtp(dto.email)
  }

  /**
   * Verifies an email OTP code submitted by the user.
   *
   * Once verified, the user can proceed with registration.
   */
  @Post("verify-otp")
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @ApiOperation({ summary: "Verify email OTP" })
  @ApiResponse({ status: 200, description: "OTP verified successfully" })
  async verifyOtp(@Body() dto: VerifyOtpDto): Promise<OtpVerificationResponseDto> {
    return this.authService.verifyEmailOtp(dto.email, dto.code)
  }

  /**
   * Registers a new user account.
   *
   * Requires email to be verified via OTP first.
   * Returns JWT token for immediate authentication.
   */
  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({ status: 201, description: "User successfully registered" })
  @ApiResponse({ status: 409, description: "User already exists" })
  async register(@Body() registerDto: RegisterDto): Promise<AuthTokenResponseDto> {
    return this.authService.register(registerDto)
  }

  /**
   * Authenticates a user with email/username and password.
   *
   * Returns JWT token on successful authentication.
   */
  @Post("login")
  @ApiOperation({ summary: "Login user" })
  @ApiResponse({ status: 200, description: "User successfully logged in" })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async login(@Body() loginDto: LoginDto): Promise<AuthTokenResponseDto> {
    return this.authService.login(loginDto)
  }

  /**
   * Sends a password reset OTP to the user's email.
   *
   * Rate limited to prevent abuse. Always returns success
   * to prevent email enumeration attacks.
   */
  @Post("forgot-password")
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 120000, limit: 1 } })
  @ApiOperation({ summary: "Send password reset OTP" })
  @ApiResponse({ status: 200, description: "Reset code sent" })
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<MessageResponseDto> {
    return this.authService.sendPasswordResetOtp(dto.email)
  }

  /**
   * Resets user password using OTP code.
   *
   * Validates OTP and updates password in one operation.
   */
  @Post("reset-password")
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @ApiOperation({ summary: "Reset password with OTP" })
  @ApiResponse({ status: 200, description: "Password reset successfully" })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<MessageResponseDto> {
    return this.authService.resetPassword(dto.email, dto.code, dto.newPassword)
  }

  /**
   * Checks if a username is available for registration.
   *
   * Returns availability status. Usernames are case-insensitive.
   */
  @Get("check-username")
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60000, limit: 20 } })
  @ApiOperation({ summary: "Check if username is available" })
  @ApiQuery({ name: "username", required: true, description: "Username to check" })
  @ApiResponse({ status: 200, description: "Username availability result" })
  async checkUsername(@Query() dto: CheckUsernameDto): Promise<UsernameAvailabilityResponseDto> {
    const available = await this.authService.isUsernameAvailable(dto.username)
    return { username: dto.username, available }
  }

  /**
   * Returns the authenticated user's profile.
   *
   * Supports both /auth/profile and /auth/me — the mobile app
   * calls /auth/me on startup to validate its stored token.
   *
   * Includes super admin flag if user is configured as super admin.
   */
  @Get(["profile", "me"])
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({ status: 200, description: "User profile retrieved" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getProfile(@Request() req): Promise<UserDataDto> {
    const superAdminEmail = this.configService
      .get("SUPER_ADMIN_EMAIL", "")
      .toLowerCase()
      .trim()
    const isSuperAdmin =
      !!superAdminEmail && (req.user?.email || "").toLowerCase() === superAdminEmail

    return UserDataDto.from(req.user, isSuperAdmin)
  }
}
