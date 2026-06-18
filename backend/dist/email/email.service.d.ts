import { ConfigService } from "@nestjs/config";
export declare class EmailService {
    private configService;
    private readonly logger;
    private readonly resend;
    constructor(configService: ConfigService);
    sendVerificationCode(email: string, code: string): Promise<void>;
    sendPasswordResetCode(email: string, code: string): Promise<void>;
}
