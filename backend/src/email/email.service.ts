/**
 * EmailService - Centralized email sending for all modules
 */
import { Injectable, BadRequestException, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Resend } from "resend"

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)
  private readonly resend: Resend | null

  constructor(private configService: ConfigService) {
    const key = this.configService.get<string | undefined>("RESEND_API_KEY")
    if (key) {
      this.resend = new Resend(key)
    } else {
      this.logger.warn("RESEND_API_KEY not set — email sending is disabled")
      this.resend = null
    }
  }

  async sendVerificationCode(email: string, code: string): Promise<void> {
    if (!this.resend) {
      this.logger.warn(`Email send skipped: RESEND_API_KEY not configured for ${email}`)
      throw new BadRequestException("Email service is not configured")
    }

    try {
      await this.resend.emails.send({
        from: "Tagmi <noreply@tagmi.social>",
        to: email,
        subject: "Your Tagmi verification code",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6; padding: 40px 20px;">
            <div style="max-width: 440px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
              <div style="padding: 32px 32px 24px; text-align: center;">
                <img src="https://cdn.tagmi.social/assets/logo.png" alt="Tagmi" style="height: 36px; margin-bottom: 24px;" />
                <h2 style="color: #111827; font-size: 20px; font-weight: 600; margin: 0 0 8px;">Verify your email</h2>
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px; line-height: 1.5;">Enter this code to continue setting up your Tagmi account:</p>
                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                  <span style="font-family: 'SF Mono', SFMono-Regular, Consolas, monospace; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #111827; user-select: all;">${code}</span>
                </div>
                <p style="color: #9ca3af; font-size: 12px; margin: 0; line-height: 1.5;">This code expires in 10 minutes.<br/>If you didn't request this, ignore this email.</p>
              </div>
            </div>
          </div>
        `,
      })
    } catch (error) {
      this.logger.error(`Failed to send verification code to ${email}: ${error.message}`)
      throw new BadRequestException("Failed to send verification email. Please try again")
    }
  }

  async sendPasswordResetCode(email: string, code: string): Promise<void> {
    if (!this.resend) {
      this.logger.warn(`Email send skipped: RESEND_API_KEY not configured for ${email}`)
      throw new BadRequestException("Email service is not configured")
    }

    try {
      await this.resend.emails.send({
        from: "Tagmi <noreply@tagmi.social>",
        to: email,
        subject: "Reset your Tagmi password",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6; padding: 40px 20px;">
            <div style="max-width: 440px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
              <div style="padding: 32px 32px 24px; text-align: center;">
                <img src="https://cdn.tagmi.social/assets/logo.png" alt="Tagmi" style="height: 36px; margin-bottom: 24px;" />
                <h2 style="color: #111827; font-size: 20px; font-weight: 600; margin: 0 0 8px;">Reset your password</h2>
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px; line-height: 1.5;">Enter this code to reset your Tagmi password:</p>
                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                  <span style="font-family: 'SF Mono', SFMono-Regular, Consolas, monospace; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #111827; user-select: all;">${code}</span>
                </div>
                <p style="color: #9ca3af; font-size: 12px; margin: 0; line-height: 1.5;">This code expires in 10 minutes.<br/>If you didn't request this, ignore this email and your password will remain unchanged.</p>
              </div>
            </div>
          </div>
        `,
      })
    } catch (error) {
      this.logger.error(`Failed to send password reset code to ${email}: ${error.message}`)
      throw new BadRequestException("Failed to send password reset email. Please try again")
    }
  }
}
