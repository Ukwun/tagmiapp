import { Controller, Post, Get, Body, UseGuards, Request, Query } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { ReportsService } from "./reports.service"
import { CreateReportDto } from "./dto/create-report.dto"

@ApiTags("reports")
@Controller("reports")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: "Create a report" })
  async createReport(@Body() createReportDto: CreateReportDto, @Request() req) {
    const report = await this.reportsService.createReport({
      ...createReportDto,
      reporterId: req.user.id,
    })
    return { success: true, data: report }
  }

  @Get("my-reports")
  @ApiOperation({ summary: "Get my reports" })
  async getMyReports(@Request() req, @Query("page") page?: number, @Query("limit") limit?: number) {
    return this.reportsService.getMyReports(req.user.id, page ? +page : 1, limit ? +limit : 20)
  }
}
