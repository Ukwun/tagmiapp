import { IsEnum, IsOptional, IsString, IsUUID } from "class-validator"
import { ReportType, ReportReason } from "../entities/report.entity"

export class CreateReportDto {
  @IsEnum(ReportType)
  type: ReportType

  @IsEnum(ReportReason)
  reason: ReportReason

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsUUID()
  targetUserId?: string

  @IsOptional()
  @IsUUID()
  targetPostId?: string

  @IsOptional()
  @IsUUID()
  targetCommentId?: string
}
