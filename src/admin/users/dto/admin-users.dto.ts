import { IsOptional, IsString, IsEnum, IsBoolean } from "class-validator"
import { ApiPropertyOptional, ApiProperty } from "@nestjs/swagger"
import { Type, Transform } from "class-transformer"
import { PaginationQueryDto } from "../../dto/pagination.dto"

export class UserSearchQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: "Search by username, email, or display name" })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({ enum: ["talent", "client", "manager"] })
  @IsOptional()
  @IsEnum(["talent", "client", "manager"])
  role?: string

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  isActive?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  isVerified?: boolean
}

export class ToggleActiveDto {
  @ApiProperty()
  @IsBoolean()
  isActive: boolean
}

export class ToggleVerifiedDto {
  @ApiProperty()
  @IsBoolean()
  isVerified: boolean
}

export class ChangeRoleDto {
  @ApiProperty({ enum: ["talent", "client", "manager"] })
  @IsEnum(["talent", "client", "manager"])
  role: string
}

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  displayName?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  username?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string
}
