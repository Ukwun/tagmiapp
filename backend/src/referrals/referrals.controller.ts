import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Request,
  UseGuards,
  Ip,
} from "@nestjs/common"
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger"
import { Throttle } from "@nestjs/throttler"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { ReferralsService } from "./referrals.service"
import { ValidationPipelineService } from "./services/validation-pipeline.service"
import { TrackReferralDto } from "./dto/track-referral.dto"

@ApiTags("referrals")
@Controller("referrals")
export class ReferralsController {
  constructor(
    private readonly referralsService: ReferralsService,
    private readonly validationPipelineService: ValidationPipelineService,
  ) {}

  @Post("track")
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async trackReferralClick(
    @Body() dto: TrackReferralDto,
    @Ip() ip: string,
  ) {
    return this.referralsService.trackReferralClick(
      dto.referralCode,
      ip,
      dto.fingerprint,
      dto.userAgent,
    )
  }

  @Get("my-referrals")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getMyReferrals(
    @Request() req,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const result = await this.referralsService.getMyReferrals(
      req.user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    )

    // Re-run validation for any active referrals so the referrer sees fresh checkpoint statuses
    for (const referral of result.data) {
      if (referral.status === "validating") {
        await this.validationPipelineService.runValidation(referral.id)
      }
    }

    // Re-fetch after validation runs to get updated data
    return this.referralsService.getMyReferrals(
      req.user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    )
  }

  @Get("stats")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getReferralStats(@Request() req) {
    return this.referralsService.getReferralStats(req.user.id)
  }

  @Get("my-link")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getMyReferralLink(@Request() req) {
    const link = await this.referralsService.getMyReferralLink(req.user.id)
    return { referralLink: link }
  }

  @Get("validation-status")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getMyValidationStatus(@Request() req) {
    const referral = await this.validationPipelineService.getActiveReferralForUser(req.user.id)
    if (!referral) {
      return { active: false, validations: [] }
    }

    // Re-run validation to get fresh results
    await this.validationPipelineService.runValidation(referral.id)

    const validations = await this.validationPipelineService.getValidationStatus(referral.id)
    return {
      active: true,
      referralId: referral.id,
      deadline: referral.validationDeadline,
      validations,
    }
  }

}
