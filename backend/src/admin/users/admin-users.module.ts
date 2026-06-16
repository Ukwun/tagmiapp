import { Module } from "@nestjs/common"
import { AdminUsersService } from "./admin-users.service"
import { AdminUsersController } from "./admin-users.controller"
import { UsersModule } from "../../users/users.module"
import { ContentModule } from "../../content/content.module"
import { ReportsModule } from "../../reports/reports.module"
import { BookingsModule } from "../../bookings/bookings.module"

@Module({
  imports: [UsersModule, ContentModule, ReportsModule, BookingsModule],
  controllers: [AdminUsersController],
  providers: [AdminUsersService],
})
export class AdminUsersModule {}
