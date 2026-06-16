import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { NotificationsController } from "./notifications.controller"
import { NotificationsService } from "./notifications.service"
import { Notification } from "./entities/notification.entity"
import { User } from "../users/entities/user.entity"
import { NotificationRepository } from "./repositories/notification.repository"
import { UserRepository } from "../users/repositories/user.repository"

@Module({
  imports: [TypeOrmModule.forFeature([Notification, User])],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationRepository, UserRepository],
  exports: [NotificationsService],
})
export class NotificationsModule {}
