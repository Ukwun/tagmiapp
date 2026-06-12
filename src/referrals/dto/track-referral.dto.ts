import { IsString, IsOptional } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class TrackReferralDto {
  @ApiProperty({ description: "The referral code (username of referrer)" })
  @IsString()
  referralCode: string

  @ApiPropertyOptional({ description: "Device fingerprint hash" })
  @IsOptional()
  @IsString()
  fingerprint?: string

  @ApiPropertyOptional({ description: "User agent string" })
  @IsOptional()
  @IsString()
  userAgent?: string
}
