/**
 * ForgotPasswordDto
 *
 * Validates email when user requests a password reset.
 * Email is normalized to lowercase and trimmed.
 */
import { IsEmail } from "class-validator"
import { Transform } from "class-transformer"

export class ForgotPasswordDto {
  @IsEmail({}, { message: "Please enter a valid email address" })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string
}
