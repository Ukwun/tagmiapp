import { IsString, IsOptional, IsArray, IsEnum, IsUUID } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class CreateMessageDto {
  @ApiProperty({ description: "Message content" })
  @IsString()
  content: string

  @ApiProperty({ description: "Message type", enum: ["text", "image", "file", "system"] })
  @IsOptional()
  @IsEnum(["text", "image", "file", "system"])
  type?: "text" | "image" | "file" | "system"

  @ApiProperty({ description: "File attachments", required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[]

  @ApiProperty({ description: "ID of message being replied to", required: false })
  @IsOptional()
  @IsUUID()
  replyToId?: string
}
