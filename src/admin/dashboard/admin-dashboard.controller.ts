import { Controller, Get, UseGuards } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { AdminGuard } from "../../auth/guards/admin.guard"
import { AdminDashboardService } from "./admin-dashboard.service"

@ApiTags("Admin - Dashboard")
@Controller("admin")
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminDashboardController {
  constructor(private readonly dashboardService: AdminDashboardService) {}

  @Get("dashboard")
  @ApiOperation({ summary: "Get platform-wide dashboard KPIs" })
  async getDashboard() {
    return this.dashboardService.getDashboardOverview()
  }

  @Get("analytics/feed-performance")
  @ApiOperation({ summary: "Compare personalized vs randomized feed performance metrics" })
  async getFeedPerformance() {
    return this.dashboardService.getFeedPerformanceMetrics()
  }
}
