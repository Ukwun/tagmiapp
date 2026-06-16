import { IsString, IsOptional, IsArray } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class CreateContentDto {
  @ApiProperty({ example: "Check out my new post!", required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ example: ["travel", "photography", "nature"], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @ApiProperty({ type: "string", format: "binary" })
  file: any
}
