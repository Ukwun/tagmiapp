import { Module, forwardRef } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UsersController } from "./users.controller"
import { UsersService } from "./users.service"
import { User } from "./entities/user.entity"
import { TalentProfile } from "./entities/talent-profile.entity"
import { ClientProfile } from "./entities/client-profile.entity"
import { UserSettings } from "./entities/user-settings.entity"
import { StorageService } from "../config/storage.service"
import { ReferralsModule } from "../referrals/referrals.module"
import { FollowsModule } from "../follows/follows.module"
import { UserRepository } from "./repositories/user.repository"
import { TalentProfileRepository } from "./repositories/talent-profile.repository"
import { ClientProfileRepository } from "./repositories/client-profile.repository"
import { UserSettingsRepository } from "./repositories/user-settings.repository"

@Module({
  imports: [
    TypeOrmModule.forFeature([User, TalentProfile, ClientProfile, UserSettings]),
    forwardRef(() => ReferralsModule),
    forwardRef(() => FollowsModule),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    StorageService,
    UserRepository,
    TalentProfileRepository,
    ClientProfileRepository,
    UserSettingsRepository,
  ],
  exports: [
    UsersService,
    UserRepository,
    TalentProfileRepository,
    ClientProfileRepository,
    UserSettingsRepository,
  ],
})
export class UsersModule {}
