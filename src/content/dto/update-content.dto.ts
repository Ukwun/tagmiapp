import { IsString, IsOptional, IsArray, IsBoolean } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class UpdateContentDto {
  @ApiProperty({ example: "Updated caption text", required: false })
  @IsOptional()
  @IsString()
  caption?: string

  @ApiProperty({ example: "#667eea", required: false })
  @IsOptional()
  @IsString()
  backgroundColor?: string

  @ApiProperty({ example: "bold", required: false })
  @IsOptional()
  @IsString()
  fontStyle?: string

  @ApiProperty({ example: "https://storage.example.com/music.mp3", required: false })
  @IsOptional()
  @IsString()
  backgroundMusicUrl?: string

  @ApiProperty({ example: ["design", "updated"], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[]

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean
}
