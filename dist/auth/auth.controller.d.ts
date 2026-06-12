import { ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { RegisterDto, LoginDto, SendOtpDto, VerifyOtpDto, ForgotPasswordDto, ResetPasswordDto, CheckUsernameDto, AuthTokenResponseDto, MessageResponseDto, OtpVerificationResponseDto, UsernameAvailabilityResponseDto, UserDataDto } from "./dto";
export declare class AuthController {
    private authService;
    private configService;
    constructor(authService: AuthService, configService: ConfigService);
    sendOtp(dto: SendOtpDto): Promise<MessageResponseDto>;
    verifyOtp(dto: VerifyOtpDto): Promise<OtpVerificationResponseDto>;
    register(registerDto: RegisterDto): Promise<AuthTokenResponseDto>;
    login(loginDto: LoginDto): Promise<AuthTokenResponseDto>;
    forgotPassword(dto: ForgotPasswordDto): Promise<MessageResponseDto>;
    resetPassword(dto: ResetPasswordDto): Promise<MessageResponseDto>;
    checkUsername(dto: CheckUsernameDto): Promise<UsernameAvailabilityResponseDto>;
    getProfile(req: any): Promise<UserDataDto>;
}
