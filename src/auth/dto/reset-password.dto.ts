/**
 * ResetPasswordDto
 *
 * Validates password reset request with email, OTP code, and new password.
 * Email is normalized, code must be 6 digits, password must meet minimum requirements.
 */
import { IsEmail, IsString, Length, Matches, MinLength } from "class-validator"
import { Transform } from "class-transformer"

export class ResetPasswordDto {
  @IsEmail({}, { message: "Please enter a valid email address" })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string

  @IsString()
  @Length(6, 6, { message: "Reset code must be 6 digits" })
  @Matches(/^[0-9]+$/, { message: "Reset code must contain only numbers" })
  code: string

  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  newPassword: string
}
