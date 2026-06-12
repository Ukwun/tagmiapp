import { IsString, IsNumber, IsOptional, IsArray, IsDateString, IsUUID, Min } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class CreateBookingDto {
  @ApiProperty({ description: "ID of the talent to book" })
  @IsUUID()
  talentId: string

  @ApiProperty({ description: "Title of the booking" })
  @IsString()
  title: string

  @ApiProperty({ description: "Detailed description of the work needed" })
  @IsString()
  description: string

  @ApiProperty({ description: "Budget for the project" })
  @IsNumber()
  @Min(0)
  budget: number

  @ApiProperty({ description: "Start date of the project" })
  @IsDateString()
  startDate: Date

  @ApiProperty({ description: "End date of the project", required: false })
  @IsOptional()
  @IsDateString()
  endDate?: Date

  @ApiProperty({ description: "List of requirements", required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[]

  @ApiProperty({ description: "List of expected deliverables", required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  deliverables?: string[]
}
