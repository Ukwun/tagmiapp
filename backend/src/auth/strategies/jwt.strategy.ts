/**
 * JwtStrategy
 *
 * Passport strategy for JWT token validation. Extracts bearer token from
 * Authorization header, verifies signature with JWT_SECRET, and loads user
 * from database. Rejects inactive users.
 *
 * Used by: JwtAuthGuard, OptionalJwtAuthGuard
 */
import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import { ConfigService } from "@nestjs/config"
import { AuthService } from "../auth.service"
import { ErrorHandler } from "../../common/exceptions/error.handler"
import { ERROR_MESSAGES } from "../../common/constants/error-messages.constant"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET") || "your-secret-key",
    })
  }

  /**
   * Validates JWT payload and loads user from database.
   * Rejects tokens for inactive or deleted users.
   */
  async validate(payload: any) {
    const user = await this.authService.findById(payload.sub)
    if (!user || !user.isActive) {
      ErrorHandler.unauthorized(ERROR_MESSAGES.TOKEN_INVALID)
    }
    return user
  }
}
