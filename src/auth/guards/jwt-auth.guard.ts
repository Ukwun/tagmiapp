/**
 * JwtAuthGuard
 *
 * Protects routes that require authentication. Uses JWT strategy to validate
 * bearer tokens from the Authorization header. Rejects requests with missing
 * or invalid tokens.
 *
 * Usage: @UseGuards(JwtAuthGuard) on controllers or routes
 */
import { Injectable } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
