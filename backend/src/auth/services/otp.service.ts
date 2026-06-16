/**
 * OtpService
 *
 * Handles all OTP (one-time password) operations for email verification
 * and password resets. This service generates codes, sends emails via EmailService,
 * and verifies codes when users submit them.
 *
 * It does NOT handle user registration — that is AuthService's job.
 * It does NOT authenticate users — that is JwtAuthGuard's job.
 * It does NOT send emails directly — that is EmailService's job.
 * It only manages the OTP lifecycle: generate → send → verify.
 *
 * We rate limit OTP sends to prevent abuse (max 1 per 2 minutes per email).
 * Codes expire after 10 minutes for security.
 *
 * Used by: AuthService
 */
import {
  Injectable,
  BadRequestException,
  ConflictException,
  Logger,
} from "@nestjs/common";
import { MessageResponseDto } from "../dto/auth-response.dto";
import { ErrorHandler } from "../../common/exceptions/error.handler";
import { ERROR_MESSAGES } from "../../common/constants/error-messages.constant";
import { UserRepository } from "../../users/repositories/user.repository";
import { OtpRepository } from "../repositories/otp.repository";
import { EmailService } from "../../email/email.service";

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    private userRepository: UserRepository,
    private otpRepository: OtpRepository,
    private emailService: EmailService,
  ) {}

  /**
   * Sends an email verification OTP to a new user.
   *
   * We check if the email is already registered first to prevent
   * sending codes to existing accounts. This stops bad actors from
   * spamming verification emails to real users.
   *
   * Rate limiting (1 per 2 minutes) prevents abuse and reduces email costs.
   * The 2-minute window is long enough to deter automation but short enough
   * that legitimate users can retry if the first email doesn't arrive.
   *
   * @param email - Email address to send OTP to
   * @returns Success message
   */
  async sendEmailOtp(email: string): Promise<MessageResponseDto> {
    const emailLower = email.toLowerCase().trim();

    // Check if email already registered
    const existingUser = await this.userRepository.findByEmail(emailLower);
    if (existingUser) {
      ErrorHandler.conflict("User", "email", emailLower);
    }

    // Rate limit: max 1 OTP per 2 minutes per email
    const recentOtp = await this.otpRepository.findRecentOtp(emailLower, 2);
    if (recentOtp) {
      throw new BadRequestException(ERROR_MESSAGES.OTP_RATE_LIMIT);
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP (expires in 10 minutes)
    await this.otpRepository.create(
      emailLower,
      code,
      new Date(Date.now() + 10 * 60_000),
    );

    // Send email via EmailService
    await this.emailService.sendVerificationCode(emailLower, code);

    return { message: "Verification code sent" };
  }

  /**
   * Verifies an email OTP code submitted by the user.
   *
   * We mark the OTP as verified instead of deleting it so we have
   * an audit trail. This helps debug issues like "user says they
   * verified but registration fails."
   *
   * Only unverified codes that haven't expired are accepted.
   * Once verified, the code can be used exactly once for registration.
   *
   * @param email - Email address
   * @param code - 6-digit OTP code
   * @returns Verification result
   */
  async verifyEmailOtp(
    email: string,
    code: string,
  ): Promise<{ verified: boolean }> {
    const emailLower = email.toLowerCase().trim();

    const otp = await this.otpRepository.findValidOtp(emailLower, code);

    if (!otp) {
      throw new BadRequestException(ERROR_MESSAGES.OTP_INVALID);
    }

    otp.verified = true;
    await this.otpRepository.save(otp);

    return { verified: true };
  }

  /**
   * Checks if an email has a verified OTP.
   *
   * We call this during registration to ensure the user went through
   * the verification flow. If they try to register without verifying,
   * we reject them here instead of letting them create an unverified account.
   *
   * @param email - Email to check
   * @returns True if email has been verified
   */
  async isEmailVerified(email: string): Promise<boolean> {
    const otp = await this.otpRepository.findVerifiedOtp(
      email.toLowerCase().trim(),
    );
    return !!otp;
  }

  /**
   * Sends a password reset OTP to an existing user.
   *
   * Unlike email verification, this requires the user to already exist.
   * We don't reveal whether the email exists or not to prevent enumeration
   * attacks (bad actors checking which emails have accounts).
   *
   * If the email doesn't exist, we silently succeed but don't send anything.
   * This is a security feature, not a bug.
   *
   * @param email - Email address
   * @returns Success message (always, regardless of whether user exists)
   */
  async sendPasswordResetOtp(email: string): Promise<MessageResponseDto> {
    const emailLower = email.toLowerCase().trim();

    // Check if user exists
    const user = await this.userRepository.findByEmail(emailLower);

    // Always return success, even if user doesn't exist (security)
    if (!user) {
      return { message: "If that email exists, a reset code has been sent" };
    }

    // Rate limit: max 1 OTP per 2 minutes
    const resetEmail = `reset:${emailLower}`;
    const recentOtp = await this.otpRepository.findRecentOtp(resetEmail, 2);
    if (recentOtp) {
      throw new BadRequestException(ERROR_MESSAGES.OTP_RATE_LIMIT);
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP with reset: prefix to distinguish from email verification OTPs
    await this.otpRepository.create(
      resetEmail,
      code,
      new Date(Date.now() + 10 * 60_000),
    );

    // Send email (use actual email, not prefixed version)
    await this.emailService.sendPasswordResetCode(emailLower, code);

    return { message: "If that email exists, a reset code has been sent" };
  }

}
