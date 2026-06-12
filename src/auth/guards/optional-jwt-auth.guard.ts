/**
 * OptionalJwtAuthGuard
 *
 * Like JwtAuthGuard, but doesn't reject requests with missing/invalid tokens.
 * Returns user object if valid token present, null otherwise. Useful for routes
 * that behave differently for authenticated vs anonymous users.
 *
 * Usage: @UseGuards(OptionalJwtAuthGuard) on controllers or routes
 */
import { Injectable } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard("jwt") {
  /**
   * Never throws — returns user if authenticated, null if not.
   */
  handleRequest(err: any, user: any) {
    return user || null
  }
}
