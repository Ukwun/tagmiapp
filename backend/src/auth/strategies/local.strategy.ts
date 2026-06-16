/**
 * LocalStrategy
 *
 * Passport strategy for username/password authentication. Validates credentials
 * using AuthService.validateUser() and returns user object on success.
 *
 * Note: "email" field accepts both email and username for user convenience.
 * Used by: LocalAuthGuard (if implemented)
 */
import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Strategy } from "passport-local"
import { AuthService } from "../auth.service"
import { ErrorHandler } from "../../common/exceptions/error.handler"
import { ERROR_MESSAGES } from "../../common/constants/error-messages.constant"

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: "email" })
  }

  /**
   * Validates user credentials. Returns user object on success.
   */
  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password)
    if (!user) {
      ErrorHandler.unauthorized(ERROR_MESSAGES.INVALID_CREDENTIALS)
    }
    return user
  }
}
