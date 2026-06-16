import { IsArray, ValidateNested, IsUUID, IsEnum, IsNumber, IsBoolean, IsOptional, Min, Max, IsString } from "class-validator"
import { Type } from "class-transformer"
import { ApiProperty } from "@nestjs/swagger"

export class EngagementSignalDto {
  @ApiProperty()
  @IsUUID()
  contentId: string

  @ApiProperty()
  @IsString()
  postId: string

  @ApiProperty({ enum: ["video", "audio", "image", "text"] })
  @IsEnum(["video", "audio", "image", "text"])
  contentType: "video" | "audio" | "image" | "text"

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(1)
  mediaProgress: number

  @ApiProperty()
  @IsBoolean()
  mediaCompleted: boolean

  @ApiProperty()
  @IsNumber()
  @Min(0)
  dwellTimeMs: number

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  scrollDepth?: number

  @ApiProperty()
  @IsNumber()
  @Min(0)
  slideIndex: number

  @ApiProperty()
  @IsNumber()
  @Min(1)
  totalSlides: number
}

export class CreateEngagementSignalsDto {
  @ApiProperty({ type: [EngagementSignalDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EngagementSignalDto)
  signals: EngagementSignalDto[]
}
