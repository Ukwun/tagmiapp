import { Controller, Get, Patch, Delete, Param, Body, Query, UseGuards } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { AdminGuard } from "../../auth/guards/admin.guard"
import { AdminReportsService } from "./admin-reports.service"
import { ReportSearchQueryDto, ResolveReportDto } from "./dto/admin-reports.dto"

@ApiTags("Admin - Reports")
@Controller("admin/reports")
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminReportsController {
  constructor(private readonly reportsService: AdminReportsService) {}

  @Get()
  @ApiOperation({ summary: "List reports with filters (pending first)" })
  async getReports(@Query() query: ReportSearchQueryDto) {
    return this.reportsService.getReports(query)
  }

  @Get(":id")
  @ApiOperation({ summary: "Get report detail with target entity" })
  async getReportDetail(@Param("id") id: string) {
    return this.reportsService.getReportDetail(id)
  }

  @Patch(":id/resolve")
  @ApiOperation({ summary: "Resolve or dismiss a report" })
  async resolveReport(@Param("id") id: string, @Body() dto: ResolveReportDto) {
    return this.reportsService.resolveReport(id, dto)
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a report permanently" })
  async deleteReport(@Param("id") id: string) {
    return this.reportsService.deleteReport(id)
  }
}
