import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { RegisterDto } from "./dto/register.dto";
import type { LoginDto } from "./dto/login.dto";
import { AuthTokenResponseDto, MessageResponseDto, OtpVerificationResponseDto } from "./dto/auth-response.dto";
import { OtpService } from "./services/otp.service";
import { ReferralsService } from "../referrals/referrals.service";
import { UserRepository } from "../users/repositories/user.repository";
import type { User } from "../users/entities/user.entity";
export declare class AuthService {
    private userRepository;
    private jwtService;
    private otpService;
    private configService;
    private referralsService?;
    private readonly logger;
    constructor(userRepository: UserRepository, jwtService: JwtService, otpService: OtpService, configService: ConfigService, referralsService?: ReferralsService);
    sendEmailOtp(email: string): Promise<MessageResponseDto>;
    verifyEmailOtp(email: string, code: string): Promise<OtpVerificationResponseDto>;
    register(registerDto: RegisterDto): Promise<AuthTokenResponseDto>;
    login(loginDto: LoginDto): Promise<AuthTokenResponseDto>;
    validateUser(email: string, password: string): Promise<any>;
    sendPasswordResetOtp(email: string): Promise<MessageResponseDto>;
    resetPassword(email: string, code: string, newPassword: string): Promise<MessageResponseDto>;
    isUsernameAvailable(username: string): Promise<boolean>;
    findById(id: string): Promise<User | null>;
}
