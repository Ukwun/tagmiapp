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
var OtpService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpService = void 0;
const common_1 = require("@nestjs/common");
const error_handler_1 = require("../../common/exceptions/error.handler");
const error_messages_constant_1 = require("../../common/constants/error-messages.constant");
const user_repository_1 = require("../../users/repositories/user.repository");
const otp_repository_1 = require("../repositories/otp.repository");
const email_service_1 = require("../../email/email.service");
let OtpService = OtpService_1 = class OtpService {
    constructor(userRepository, otpRepository, emailService) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.emailService = emailService;
        this.logger = new common_1.Logger(OtpService_1.name);
    }
    async sendEmailOtp(email) {
        const emailLower = email.toLowerCase().trim();
        const existingUser = await this.userRepository.findByEmail(emailLower);
        if (existingUser) {
            error_handler_1.ErrorHandler.conflict("User", "email", emailLower);
        }
        const recentOtp = await this.otpRepository.findRecentOtp(emailLower, 2);
        if (recentOtp) {
            throw new common_1.BadRequestException(error_messages_constant_1.ERROR_MESSAGES.OTP_RATE_LIMIT);
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        await this.otpRepository.create(emailLower, code, new Date(Date.now() + 10 * 60_000));
        await this.emailService.sendVerificationCode(emailLower, code);
        return { message: "Verification code sent" };
    }
    async verifyEmailOtp(email, code) {
        const emailLower = email.toLowerCase().trim();
        const otp = await this.otpRepository.findValidOtp(emailLower, code);
        if (!otp) {
            throw new common_1.BadRequestException(error_messages_constant_1.ERROR_MESSAGES.OTP_INVALID);
        }
        otp.verified = true;
        await this.otpRepository.save(otp);
        return { verified: true };
    }
    async isEmailVerified(email) {
        const otp = await this.otpRepository.findVerifiedOtp(email.toLowerCase().trim());
        return !!otp;
    }
    async sendPasswordResetOtp(email) {
        const emailLower = email.toLowerCase().trim();
        const user = await this.userRepository.findByEmail(emailLower);
        if (!user) {
            return { message: "If that email exists, a reset code has been sent" };
        }
        const resetEmail = `reset:${emailLower}`;
        const recentOtp = await this.otpRepository.findRecentOtp(resetEmail, 2);
        if (recentOtp) {
            throw new common_1.BadRequestException(error_messages_constant_1.ERROR_MESSAGES.OTP_RATE_LIMIT);
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        await this.otpRepository.create(resetEmail, code, new Date(Date.now() + 10 * 60_000));
        await this.emailService.sendPasswordResetCode(emailLower, code);
        return { message: "If that email exists, a reset code has been sent" };
    }
};
exports.OtpService = OtpService;
exports.OtpService = OtpService = OtpService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_repository_1.UserRepository,
        otp_repository_1.OtpRepository,
        email_service_1.EmailService])
], OtpService);
//# sourceMappingURL=otp.service.js.map