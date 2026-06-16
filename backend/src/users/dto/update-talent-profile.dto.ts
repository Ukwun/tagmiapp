/**
 * UpdateTalentProfileDto - Validates talent profile updates (services, rates, skills, availability).
 */
import { IsString, IsOptional, IsArray, IsNumber, IsBoolean, IsUrl, Min, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { ApiProperty } from "@nestjs/swagger"

export class ServiceItemDto {
  @IsString()
  name: string

  @IsString()
  description: string

  @IsNumber()
  @Min(0)
  price: number
}

export class UpdateTalentProfileDto {
  @ApiProperty({ example: "Experienced graphic designer with 5+ years in the industry", required: false })
  @IsOptional()
  @IsString()
  bio?: string

  @ApiProperty({ example: ["Graphic Design", "Logo Design", "Branding"], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[]

  @ApiProperty({ example: ["Design", "Marketing"], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[]

  @ApiProperty({ example: 50.0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number

  @ApiProperty({ example: "New York, NY", required: false })
  @IsOptional()
  @IsString()
  location?: string

  @ApiProperty({ example: ["English", "Spanish"], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[]

  @ApiProperty({ example: "https://myportfolio.com", required: false })
  @IsOptional()
  @IsUrl()
  portfolioUrl?: string

  @ApiProperty({
    example: { twitter: "https://twitter.com/username", instagram: "https://instagram.com/username" },
    required: false,
  })
  @IsOptional()
  socialLinks?: Record<string, string>

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean

  @ApiProperty({ example: true, required: false, description: "Enable booking profile to appear in artist search" })
  @IsOptional()
  @IsBoolean()
  isBookable?: boolean

  @ApiProperty({
    example: [{ name: "Shoutout Video", description: "Personalised 60-sec video message", price: 5000 }],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceItemDto)
  services?: ServiceItemDto[]
}
