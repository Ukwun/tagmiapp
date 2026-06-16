/**
 * UpdateSettingsDto - Validates user settings (notifications, privacy, bookings).
 */
import { IsOptional, IsBoolean, IsInt, Min } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class UpdateSettingsDto {
  // Notification settings
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  emailMessages?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  pushMessages?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  marketingEmails?: boolean

  // Privacy settings
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  profileVisible?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  showLocation?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  showRates?: boolean

  // Booking settings
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  autoAcceptBookings?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  requireDeposit?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  advanceNotice?: number
}
