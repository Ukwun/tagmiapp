import { Module, forwardRef } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Referral } from "./entities/referral.entity"
import { ReferralValidation } from "./entities/referral-validation.entity"
import { DeviceFingerprint } from "./entities/device-fingerprint.entity"
import { FraudFlag } from "./entities/fraud-flag.entity"
import { ReferralsService } from "./referrals.service"
import { FraudDetectionService } from "./services/fraud-detection.service"
import { ValidationPipelineService } from "./services/validation-pipeline.service"
import { ReferralsController } from "./referrals.controller"
import { WalletModule } from "../wallet/wallet.module"
import { ReferralRepository } from "./repositories/referral.repository"
import { ReferralValidationRepository } from "./repositories/referral-validation.repository"
import { DeviceFingerprintRepository } from "./repositories/device-fingerprint.repository"
import { FraudFlagRepository } from "./repositories/fraud-flag.repository"
import { UsersModule } from "../users/users.module"
import { FollowsModule } from "../follows/follows.module"
import { ContentModule } from "../content/content.module"
import { AuthModule } from "../auth/auth.module"

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Referral,
      ReferralValidation,
      DeviceFingerprint,
      FraudFlag,
    ]),
    forwardRef(() => UsersModule),
    forwardRef(() => FollowsModule),
    forwardRef(() => ContentModule),
    forwardRef(() => AuthModule),
    forwardRef(() => WalletModule),
  ],
  controllers: [ReferralsController],
  providers: [
    ReferralsService,
    FraudDetectionService,
    ValidationPipelineService,
    ReferralRepository,
    ReferralValidationRepository,
    DeviceFingerprintRepository,
    FraudFlagRepository,
  ],
  exports: [
    ReferralsService,
    FraudDetectionService,
    ValidationPipelineService,
    ReferralRepository,
    ReferralValidationRepository,
    DeviceFingerprintRepository,
    FraudFlagRepository,
  ],
})
export class ReferralsModule {}
