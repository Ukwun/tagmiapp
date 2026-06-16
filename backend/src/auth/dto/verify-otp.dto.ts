/**
 * VerifyOtpDto
 *
 * Validates email and OTP code when user submits verification code.
 * Email is normalized, code must be exactly 6 digits.
 */
import { IsEmail, IsString, Length, Matches } from "class-validator"
import { Transform } from "class-transformer"

export class VerifyOtpDto {
  @IsEmail({}, { message: "Please enter a valid email address" })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string

  @IsString()
  @Length(6, 6, { message: "Verification code must be 6 digits" })
  @Matches(/^[0-9]+$/, { message: "Verification code must contain only numbers" })
  code: string
}
