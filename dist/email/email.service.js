"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const resend_1 = require("resend");
let EmailService = EmailService_1 = class EmailService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(EmailService_1.name);
        this.resend = new resend_1.Resend(this.configService.getOrThrow("RESEND_API_KEY"));
    }
    async sendVerificationCode(email, code) {
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
            });
        }
        catch (error) {
            this.logger.error(`Failed to send verification code to ${email}: ${error.message}`);
            throw new common_1.BadRequestException("Failed to send verification email. Please try again");
        }
    }
    async sendPasswordResetCode(email, code) {
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
            });
        }
        catch (error) {
            this.logger.error(`Failed to send password reset code to ${email}: ${error.message}`);
            throw new common_1.BadRequestException("Failed to send password reset email. Please try again");
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map