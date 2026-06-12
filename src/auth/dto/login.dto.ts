/**
 * LoginDto
 *
 * Validates login credentials. The 'email' field accepts either email or username
 * for user convenience. Password is required but not validated for format (users
 * may have older passwords that don't meet current requirements).
 */
import { IsString, MinLength } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class LoginDto {
  @ApiProperty({ example: "john@example.com", description: "Email address or username" })
  @IsString()
  @MinLength(1)
  email: string

  @ApiProperty({ example: "SecurePassword123!" })
  @IsString()
  password: string
}
