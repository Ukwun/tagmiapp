import { IsString, IsOptional, IsArray, IsEnum, IsUUID } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class CreateRoomDto {
  @ApiProperty({ description: "Room name" })
  @IsString()
  name: string

  @ApiProperty({ description: "Room type", enum: ["direct", "group", "booking"] })
  @IsOptional()
  @IsEnum(["direct", "group", "booking"])
  type?: "direct" | "group" | "booking"

  @ApiProperty({ description: "Booking ID for booking rooms", required: false })
  @IsOptional()
  @IsUUID()
  bookingId?: string

  @ApiProperty({ description: "Initial participants", required: false })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  participants?: string[]
}
