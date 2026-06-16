import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ReportsService } from "./reports.service"
import { ReportsController } from "./reports.controller"
import { Report } from "./entities/report.entity"
import { ReportRepository } from "./repositories/report.repository"

@Module({
  imports: [TypeOrmModule.forFeature([Report])],
  controllers: [ReportsController],
  providers: [ReportsService, ReportRepository],
  exports: [ReportsService, ReportRepository],
})
export class ReportsModule {}
