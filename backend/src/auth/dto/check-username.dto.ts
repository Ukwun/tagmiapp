/**
 * CheckUsernameDto
 *
 * Validates username availability check requests.
 * Username must be at least 3 characters and contain only letters, numbers, and underscores.
 */
import { IsString, MinLength, Matches } from "class-validator"
import { Transform } from "class-transformer"

export class CheckUsernameDto {
  @IsString()
  @MinLength(3, { message: "Username must be at least 3 characters" })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: "Username can only contain letters, numbers, and underscores",
  })
  @Transform(({ value }) => value?.trim())
  username: string
}
