/**
 * UpdateUserDto
 *
 * Validates user profile updates — display name, bio, interests,
 * and personal details like gender, date of birth, and location.
 *
 * All fields are optional so the user can update one thing at a time
 * without sending the entire profile back.
 */
import { IsString, IsOptional, IsArray, IsDateString, IsIn } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class UpdateUserDto {
  @ApiProperty({ example: "John Doe", required: false })
  @IsOptional()
  @IsString()
  displayName?: string

  @ApiProperty({ example: "Creative professional based in Lagos", required: false })
  @IsOptional()
  @IsString()
  bio?: string

  @ApiProperty({ example: ["music", "dance", "comedy"], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[]

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
}
