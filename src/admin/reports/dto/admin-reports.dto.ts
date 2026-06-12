import { IsEnum, IsOptional, IsString } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { PaginationQueryDto } from "../../dto/pagination.dto"
import { ReportStatus, ReportType } from "../../../reports/entities/report.entity"

export class ReportSearchQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ReportStatus })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus

  @ApiPropertyOptional({ enum: ReportType })
  @IsOptional()
  @IsEnum(ReportType)
  type?: ReportType
}

export class ResolveReportDto {
  @ApiProperty({ enum: [ReportStatus.RESOLVED, ReportStatus.DISMISSED] })
  @IsEnum([ReportStatus.RESOLVED, ReportStatus.DISMISSED])
  status: ReportStatus

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adminNote?: string
}
