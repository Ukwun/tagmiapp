import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsOptional, IsArray, MaxLength } from "class-validator"

export class CreatePostDto {
  @ApiProperty({ description: "Caption for the post", maxLength: 2200, required: false })
  @IsString()
  @IsOptional()
  @MaxLength(2200)
  caption?: string

  @ApiProperty({ description: "Array of hashtags", type: [String], required: false })
  @IsArray()
  @IsOptional()
  hashtags?: string[]

  @ApiProperty({ description: "Background music URL", required: false })
  @IsString()
  @IsOptional()
  backgroundMusicUrl?: string

  @ApiProperty({ description: "Slide types array", type: Object, required: false })
  @IsOptional()
  slideTypes?: Record<number, string>

  @ApiProperty({ description: "Slide texts for text-only slides", type: Object, required: false })
  @IsOptional()
  slideTexts?: Record<number, string>

  @ApiProperty({ description: "Slide background colors", type: Object, required: false })
  @IsOptional()
  slideBackgrounds?: Record<number, string>

  @ApiProperty({ description: "Slide font styles", type: Object, required: false })
  @IsOptional()
  slideFontStyles?: Record<number, string>

  @ApiProperty({ description: "Per-slide captions", type: Object, required: false })
  @IsOptional()
  slideCaptions?: Record<number, string>

  @ApiProperty({ description: "Per-slide music file index mapping", type: Object, required: false })
  @IsOptional()
  slideMusicIndex?: Record<number, string>

  @ApiProperty({ description: "Per-slide music trim start (seconds)", type: Object, required: false })
  @IsOptional()
  slideMusicTrimStart?: Record<number, string>

  @ApiProperty({ description: "Per-slide music trim end (seconds)", type: Object, required: false })
  @IsOptional()
  slideMusicTrimEnd?: Record<number, string>

  @ApiProperty({ description: "Per-slide video trim start (seconds)", type: Object, required: false })
  @IsOptional()
  videoTrimStart?: Record<number, string>

  @ApiProperty({ description: "Per-slide video trim end (seconds)", type: Object, required: false })
  @IsOptional()
  videoTrimEnd?: Record<number, string>

  @ApiProperty({ description: "Per-slide custom thumbnail file index mapping", type: Object, required: false })
  @IsOptional()
  slideThumbnailIndex?: Record<number, string>

  @ApiProperty({ description: "Schedule post for future time (ISO 8601)", required: false })
  @IsString()
  @IsOptional()
  scheduledAt?: string
}
