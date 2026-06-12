/**
 * OtpRepository - Abstracts all EmailOtp entity database operations
 */
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, MoreThan, FindOptionsWhere } from "typeorm"
import { EmailOtp } from "../entities/email-otp.entity"

@Injectable()
export class OtpRepository {
  constructor(
    @InjectRepository(EmailOtp)
    private repository: Repository<EmailOtp>,
  ) {}

  async findRecentOtp(email: string, minutesAgo: number): Promise<EmailOtp | null> {
    return this.repository.findOne({
      where: {
        email,
        createdAt: MoreThan(new Date(Date.now() - minutesAgo * 60_000)),
      },
      order: { createdAt: "DESC" },
    })
  }

  async findValidOtp(email: string, code: string): Promise<EmailOtp | null> {
    return this.repository.findOne({
      where: {
        email,
        code,
        verified: false,
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: "DESC" },
    })
  }

  async findVerifiedOtp(email: string): Promise<EmailOtp | null> {
    return this.repository.findOne({
      where: {
        email,
        verified: true,
      },
      order: { createdAt: "DESC" },
    })
  }

  async create(email: string, code: string, expiresAt: Date): Promise<EmailOtp> {
    const otp = this.repository.create({ email, code, expiresAt })
    return this.repository.save(otp)
  }

  async save(otp: EmailOtp): Promise<EmailOtp> {
    return this.repository.save(otp)
  }

  async findOne(options: { where: FindOptionsWhere<EmailOtp>; order?: any }): Promise<EmailOtp | null> {
    return this.repository.findOne(options)
  }
}
