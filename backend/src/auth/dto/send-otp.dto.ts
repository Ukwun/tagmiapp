/**
 * SendOtpDto
 *
 * Validates email input when requesting an email verification OTP.
 * Email is normalized to lowercase and trimmed to prevent duplicates.
 */
import { IsEmail } from "class-validator"
import { Transform } from "class-transformer"

export class SendOtpDto {
  @IsEmail({}, { message: "Please enter a valid email address" })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string
}
