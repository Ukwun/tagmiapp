import { IsNumber, Min } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class WithdrawDto {
  @ApiProperty({ description: "Amount to withdraw", minimum: 1 })
  @IsNumber()
  @Min(1)
  amount: number
}
