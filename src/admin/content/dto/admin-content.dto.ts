import { IsOptional, IsString, IsEnum, IsBoolean, IsArray, IsUUID } from "class-validator"
import { ApiPropertyOptional, ApiProperty } from "@nestjs/swagger"
import { Transform } from "class-transformer"
import { PaginationQueryDto } from "../../dto/pagination.dto"

export class ContentSearchQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: "Search by caption" })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({ enum: ["text", "image", "video", "audio"] })
  @IsOptional()
  @IsEnum(["text", "image", "video", "audio"])
  contentType?: string

  @ApiPropertyOptional({ description: "Filter by user ID" })
  @IsOptional()
  @IsString()
  userId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  isActive?: boolean

  @ApiPropertyOptional({ enum: ["createdAt", "viewCount", "engagementScore"], default: "createdAt" })
  @IsOptional()
  @IsString()
  sortBy?: string
}

export class BulkContentActionDto {
  @ApiProperty({ type: [String], description: "Array of post IDs" })
  @IsArray()
  @IsString({ each: true })
  postIds: string[]

  @ApiProperty({ enum: ["activate", "deactivate"] })
  @IsEnum(["activate", "deactivate"])
  action: "activate" | "deactivate"
}
