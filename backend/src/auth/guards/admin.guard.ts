/**
 * AdminGuard
 *
 * Restricts access to admin-only routes. Checks if user has "manager" role
 * or is the configured super admin. Rejects non-admin requests.
 *
 * Usage: @UseGuards(JwtAuthGuard, AdminGuard) on controllers or routes
 */
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { ErrorHandler } from "../../common/exceptions/error.handler"
import { ERROR_MESSAGES } from "../../common/constants/error-messages.constant"

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  /**
   * Verifies user is manager or super admin. Rejects all others.
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const user = request.user

    const superAdminEmail = this.configService.get("SUPER_ADMIN_EMAIL", "").toLowerCase().trim()
    const isSuperAdmin = !!superAdminEmail && (user?.email || "").toLowerCase() === superAdminEmail

    if (user?.role !== "manager" && !isSuperAdmin) {
      ErrorHandler.forbidden(ERROR_MESSAGES.FORBIDDEN)
    }
    return true
  }
}
