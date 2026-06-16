import { Module, forwardRef } from "@nestjs/common"
import { JwtModule } from "@nestjs/jwt"
import { PassportModule } from "@nestjs/passport"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { AuthController } from "./auth.controller"
import { AuthService } from "./auth.service"
import { OtpService } from "./services/otp.service"
import { User } from "../users/entities/user.entity"
import { EmailOtp } from "./entities/email-otp.entity"
import { JwtStrategy } from "./strategies/jwt.strategy"
import { LocalStrategy } from "./strategies/local.strategy"
import { ReferralsModule } from "../referrals/referrals.module"
import { UserRepository } from "../users/repositories/user.repository"
import { OtpRepository } from "./repositories/otp.repository"
import { EmailModule } from "../email/email.module"

@Module({
  imports: [
    TypeOrmModule.forFeature([User, EmailOtp]),
    PassportModule,
    EmailModule,
    forwardRef(() => ReferralsModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET") || "your-secret-key",
        signOptions: { expiresIn: "7d" },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    OtpService,
    JwtStrategy,
    LocalStrategy,
    UserRepository,
    OtpRepository,
  ],
  exports: [AuthService, OtpService, OtpRepository],
})
export class AuthModule {}
