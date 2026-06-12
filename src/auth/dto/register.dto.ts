/**
 * RegisterDto
 *
 * Validates user registration input. Email normalized to lowercase,
 * username restricted to alphanumerics + underscores, password minimum 6 chars.
 * Optional: interests, role (talent/client), referral code, device fingerprint.
 */
import { IsEmail, IsString, MinLength, IsArray, IsOptional, Matches, IsEnum, IsIn, IsDateString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class RegisterDto {
  @ApiProperty({ example: "john@example.com" })
  @IsEmail()
  email: string

  @ApiProperty({ example: "johndoe" })
  @IsString()
  @MinLength(3)
  @Matches(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores" })
  username: string

  @ApiProperty({ example: "John Doe" })
  @IsString()
  @IsOptional()
  displayName?: string

  @ApiProperty({ example: "SecurePassword123!" })
  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters" })
  password: string

  @ApiProperty({ example: ["music", "dance", "comedy"], type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  interests?: string[]

  @ApiProperty({ example: "client", enum: ["talent", "client"] })
  @IsOptional()
  @IsEnum(["talent", "client"])
  role?: "talent" | "client"

  @ApiProperty({ example: "male", enum: ["male", "female", "non-binary", "prefer-not-to-say"], required: false })
  @IsOptional()
  @IsString()
  @IsIn(["male", "female", "non-binary", "prefer-not-to-say"], {
    message: "Please select a valid gender option.",
  })
  gender?: string

  @ApiProperty({ example: "2000-01-15", required: false })
  @IsOptional()
  @IsDateString({}, { message: "Please enter a valid date of birth." })
  dateOfBirth?: string

  @ApiProperty({ example: "Lagos, Nigeria", required: false })
  @IsOptional()
  @IsString()
  location?: string

  @IsOptional()
  @IsString()
  referralCode?: string

  @IsOptional()
  @IsString()
  fingerprint?: string
}
