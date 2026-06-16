import { Repository, FindOptionsWhere } from "typeorm";
import { EmailOtp } from "../entities/email-otp.entity";
export declare class OtpRepository {
    private repository;
    constructor(repository: Repository<EmailOtp>);
    findRecentOtp(email: string, minutesAgo: number): Promise<EmailOtp | null>;
    findValidOtp(email: string, code: string): Promise<EmailOtp | null>;
    findVerifiedOtp(email: string): Promise<EmailOtp | null>;
    create(email: string, code: string, expiresAt: Date): Promise<EmailOtp>;
    save(otp: EmailOtp): Promise<EmailOtp>;
    findOne(options: {
        where: FindOptionsWhere<EmailOtp>;
        order?: any;
    }): Promise<EmailOtp | null>;
}
