import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { AdminGuard } from "../../auth/guards/admin.guard"
import { ReferralsService } from "../../referrals/referrals.service"
import { FraudDetectionService } from "../../referrals/services/fraud-detection.service"
import { ReferralStatus } from "../../referrals/entities/referral.entity"
import { FraudFlagStatus } from "../../referrals/entities/fraud-flag.entity"

@ApiTags("Admin - Referrals")
@Controller("admin/referrals")
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminReferralsController {
  constructor(
    private readonly referralsService: ReferralsService,
    private readonly fraudDetectionService: FraudDetectionService,
  ) {}

  @Get()
  @ApiOperation({ summary: "Get all referrals (paginated, filterable)" })
  async getAllReferrals(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("status") status?: ReferralStatus,
  ) {
    return this.referralsService.getAllReferrals(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      status,
    )
  }

  @Get("stats")
  @ApiOperation({ summary: "Get referral admin statistics" })
  async getAdminStats() {
    return this.referralsService.getAdminStats()
  }

  @Get("fraud-flags")
  @ApiOperation({ summary: "Get fraud flags (paginated)" })
  async getFraudFlags(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("status") status?: FraudFlagStatus,
  ) {
    return this.fraudDetectionService.getFraudFlags(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      status,
    )
  }

  @Get(":id")
  @ApiOperation({ summary: "Get referral detail with relations" })
  async getReferralDetail(@Param("id") id: string) {
    return this.referralsService.getReferralDetail(id)
  }

  @Post(":id/approve")
  @ApiOperation({ summary: "Approve a referral" })
  async approveReferral(@Param("id") id: string) {
    return this.referralsService.adminApproveReferral(id)
  }

  @Post(":id/reject")
  @ApiOperation({ summary: "Reject a referral" })
  async rejectReferral(
    @Param("id") id: string,
    @Body() body: { reason: string },
  ) {
    return this.referralsService.adminRejectReferral(id, body.reason)
  }

  @Post("fraud-flags/:id/resolve")
  @ApiOperation({ summary: "Resolve a fraud flag" })
  async resolveFraudFlag(
    @Param("id") id: string,
    @Body() body: { status: FraudFlagStatus; resolution: string },
  ) {
    return this.fraudDetectionService.resolveFraudFlag(id, body.status, body.resolution)
  }
}
