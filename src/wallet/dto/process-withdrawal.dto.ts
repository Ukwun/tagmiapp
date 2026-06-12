import { IsBoolean, IsOptional, IsString } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class ProcessWithdrawalDto {
  @ApiProperty({ description: "Whether to approve the withdrawal" })
  @IsBoolean()
  approve: boolean

  @ApiPropertyOptional({ description: "Reason for rejection (if rejecting)" })
  @IsOptional()
  @IsString()
  reason?: string
}
