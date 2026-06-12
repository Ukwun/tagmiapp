import { IsString, IsOptional, IsUUID } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class CreateCommentDto {
  @ApiProperty({ example: "Great work! Love the design." })
  @IsString()
  text: string

  @ApiProperty({ example: "uuid-of-parent-comment", required: false })
  @IsOptional()
  @IsUUID()
  parentId?: string
}
