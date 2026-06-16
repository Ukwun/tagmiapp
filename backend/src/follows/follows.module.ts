import { Module, forwardRef } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { FollowsService } from "./follows.service"
import { FollowsController } from "./follows.controller"
import { Follow } from "./entities/follow.entity"
import { User } from "../users/entities/user.entity"
import { FollowRepository } from "./repositories/follow.repository"
import { UserRepository } from "../users/repositories/user.repository"
import { NotificationsModule } from "../notifications/notifications.module"
import { ReferralsModule } from "../referrals/referrals.module"

@Module({
  imports: [TypeOrmModule.forFeature([Follow, User]), forwardRef(() => NotificationsModule), forwardRef(() => ReferralsModule)],
  controllers: [FollowsController],
  providers: [FollowsService, FollowRepository, UserRepository],
  exports: [FollowsService, FollowRepository],
})
export class FollowsModule {}