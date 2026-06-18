"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
const auth_response_dto_1 = require("./dto/auth-response.dto");
const otp_service_1 = require("./services/otp.service");
const referrals_service_1 = require("../referrals/referrals.service");
const error_handler_1 = require("../common/exceptions/error.handler");
const error_messages_constant_1 = require("../common/constants/error-messages.constant");
const user_repository_1 = require("../users/repositories/user.repository");
let AuthService = AuthService_1 = class AuthService {
    constructor(userRepository, jwtService, otpService, configService, referralsService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.otpService = otpService;
        this.configService = configService;
        this.referralsService = referralsService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async sendEmailOtp(email) {
        return this.otpService.sendEmailOtp(email);
    }
    async verifyEmailOtp(email, code) {
        return this.otpService.verifyEmailOtp(email, code);
    }
    async register(registerDto) {
        const { email, username, password, displayName, interests, role, gender, dateOfBirth } = registerDto;
        const emailLower = email.toLowerCase().trim();
        const usernameLower = username.toLowerCase().trim();
        const emailVerified = await this.otpService.isEmailVerified(emailLower);
        if (!emailVerified) {
            throw new common_1.BadRequestException(error_messages_constant_1.ERROR_MESSAGES.ACCOUNT_NOT_VERIFIED);
        }
        const existingUser = await this.userRepository.findByEmailOrUsername(emailLower);
        if (existingUser) {
            if (existingUser.email.toLowerCase() === emailLower) {
                error_handler_1.ErrorHandler.conflict("User", "email", emailLower);
            }
            error_handler_1.ErrorHandler.conflict("User", "username", usernameLower);
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const savedUser = await this.userRepository.create({
            email: emailLower,
            username: usernameLower,
            displayName: displayName || username,
            passwordHash,
            interests: interests || [],
            role: role || "client",
            ...(gender ? { gender } : {}),
            ...(dateOfBirth ? { dateOfBirth: new Date(dateOfBirth) } : {}),
        });
        if (registerDto.referralCode && this.referralsService) {
            try {
                await this.referralsService.linkReferralToUser(registerDto.referralCode, savedUser.id, "", registerDto.fingerprint);
                this.logger.log(`Referral linked for user ${savedUser.id}`);
            }
            catch (error) {
                this.logger.warn(`Failed to link referral for user ${savedUser.id}: ${error.message}`);
            }
        }
        const payload = { sub: savedUser.id, email: savedUser.email, username: savedUser.username };
        const token = this.jwtService.sign(payload);
        return auth_response_dto_1.AuthTokenResponseDto.from(token, savedUser);
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.userRepository.findByEmailOrUsernameWithPassword(email);
        if (!user || !user.isActive) {
            error_handler_1.ErrorHandler.unauthorized(error_messages_constant_1.ERROR_MESSAGES.INVALID_CREDENTIALS);
        }
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            error_handler_1.ErrorHandler.unauthorized(error_messages_constant_1.ERROR_MESSAGES.INVALID_CREDENTIALS);
        }
        await this.userRepository.update(user.id, { lastLogin: new Date() });
        const superAdminEmail = this.configService.get("SUPER_ADMIN_EMAIL", "").toLowerCase().trim();
        const isSuperAdmin = !!superAdminEmail && user.email.toLowerCase() === superAdminEmail;
        if (isSuperAdmin && user.role !== "manager") {
            await this.userRepository.update(user.id, { role: "manager" });
            user.role = "manager";
            this.logger.log(`Auto-promoted super-admin ${user.email} to manager`);
        }
        const payload = { sub: user.id, email: user.email, username: user.username, role: user.role };
        const token = this.jwtService.sign(payload);
        return auth_response_dto_1.AuthTokenResponseDto.from(token, user, isSuperAdmin);
    }
    async validateUser(email, password) {
        const user = await this.userRepository.findByEmailOrUsernameWithPassword(email);
        if (user && user.isActive && (await bcrypt.compare(password, user.passwordHash))) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }
    async sendPasswordResetOtp(email) {
        return this.otpService.sendPasswordResetOtp(email);
    }
    async resetPassword(email, code, newPassword) {
        const emailLower = email.toLowerCase().trim();
        await this.otpService.verifyEmailOtp(`reset:${emailLower}`, code);
        const user = await this.userRepository.findByEmail(emailLower);
        if (!user || !user.isActive) {
            error_handler_1.ErrorHandler.notFound("User");
        }
        const passwordHash = await bcrypt.hash(newPassword, 10);
        await this.userRepository.update(user.id, { passwordHash });
        return { message: "Password reset successfully" };
    }
    async isUsernameAvailable(username) {
        const existing = await this.userRepository.findByUsernameOptional(username.toLowerCase());
        return !existing;
    }
    async findById(id) {
        return this.userRepository.findByIdOptional(id);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, common_1.Optional)()),
    __param(4, (0, common_1.Inject)(referrals_service_1.ReferralsService)),
    __metadata("design:paramtypes", [user_repository_1.UserRepository,
        jwt_1.JwtService,
        otp_service_1.OtpService,
        config_1.ConfigService,
        referrals_service_1.ReferralsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map