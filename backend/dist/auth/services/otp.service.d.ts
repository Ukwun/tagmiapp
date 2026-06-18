import { MessageResponseDto } from "../dto/auth-response.dto";
import { UserRepository } from "../../users/repositories/user.repository";
import { OtpRepository } from "../repositories/otp.repository";
import { EmailService } from "../../email/email.service";
export declare class OtpService {
    private userRepository;
    private otpRepository;
    private emailService;
    private readonly logger;
    constructor(userRepository: UserRepository, otpRepository: OtpRepository, emailService: EmailService);
    sendEmailOtp(email: string): Promise<MessageResponseDto>;
    verifyEmailOtp(email: string, code: string): Promise<{
        verified: boolean;
    }>;
    isEmailVerified(email: string): Promise<boolean>;
    sendPasswordResetOtp(email: string): Promise<MessageResponseDto>;
}
