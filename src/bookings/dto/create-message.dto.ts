import { IsString, IsOptional, IsArray } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class CreateMessageDto {
  @ApiProperty({ description: "Message content" })
  @IsString()
  message: string

  @ApiProperty({ description: "File attachments", required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[]
}
