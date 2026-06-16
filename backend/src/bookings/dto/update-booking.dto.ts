import { PartialType } from "@nestjs/swagger"
import { IsOptional, IsEnum } from "class-validator"
import { CreateBookingDto } from "./create-booking.dto"

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  @IsOptional()
  @IsEnum(["pending", "accepted", "rejected", "in_progress", "completed", "cancelled", "paid"])
  status?: "pending" | "accepted" | "rejected" | "in_progress" | "completed" | "cancelled" | "paid"
}
