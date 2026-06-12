/**
 * ErrorHandler
 *
 * Provides standardized error throwing across the backend.
 * Instead of every service writing `throw new NotFoundException(...)`,
 * they call ErrorHandler.notFound() which generates consistent messages.
 *
 * All error messages come from ERROR_MESSAGES constants to ensure
 * consistency across the entire application.
 *
 * This handler does NOT catch errors — that is GlobalExceptionFilter's job.
 * It only helps services throw errors with consistent formatting.
 *
 * It does NOT log errors — the exception filter handles that.
 *
 * Used by: all services throughout the backend.
 */
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  UnauthorizedException,
} from "@nestjs/common"
import { ERROR_MESSAGES } from "../constants/error-messages.constant"

export class ErrorHandler {
  /**
   * Throws a 404 error with a friendly message.
   *
   * Use this when a requested resource does not exist.
   * Messages are user-friendly and never expose technical details or IDs.
   *
   * @param resource - Name of the resource (e.g., 'User', 'Booking', 'Content')
   * @param identifier - Optional ID (not included in message, just for logging)
   */
  static notFound(resource: string, identifier?: string): never {
    const friendlyMessages: Record<string, string> = {
      User: ERROR_MESSAGES.USER_NOT_FOUND,
      Booking: ERROR_MESSAGES.BOOKING_NOT_FOUND,
      Content: ERROR_MESSAGES.CONTENT_NOT_FOUND,
      Comment: ERROR_MESSAGES.COMMENT_NOT_FOUND,
      Message: ERROR_MESSAGES.MESSAGE_NOT_FOUND,
      Wallet: ERROR_MESSAGES.WALLET_NOT_FOUND,
      Conversation: ERROR_MESSAGES.CONVERSATION_NOT_FOUND,
      Track: ERROR_MESSAGES.TRACK_NOT_FOUND,
      Playlist: ERROR_MESSAGES.PLAYLIST_NOT_FOUND,
    }
    const message = friendlyMessages[resource] || ERROR_MESSAGES.NOT_FOUND
    throw new NotFoundException(message)
  }

  /**
   * Throws a 403 error with a friendly message.
   *
   * Use this when the user is authenticated but does not have permission.
   * Messages are friendly and don't reveal system details.
   *
   * @param action - The action they tried to perform (e.g., 'edit', 'delete')
   * @param resource - Optional resource name (not always used in message)
   */
  static forbidden(action: string, resource?: string): never {
    throw new ForbiddenException(ERROR_MESSAGES.FORBIDDEN)
  }

  /**
   * Throws a 400 error with a custom message.
   *
   * Use this for validation failures or business rule violations.
   * Keep messages specific so the user knows exactly what went wrong.
   *
   * @param message - Clear description of what went wrong
   */
  static badRequest(message: string): never {
    throw new BadRequestException(message)
  }

  /**
   * Throws a 409 error for duplicate resources.
   *
   * Use this when a unique constraint would be violated.
   * Messages are friendly and don't expose the actual value.
   *
   * @param resource - Name of the resource
   * @param field - The field that must be unique (e.g., 'email', 'username')
   * @param value - The duplicate value (not included in message)
   */
  static conflict(resource: string, field: string, value: string): never {
    const friendlyMessages: Record<string, string> = {
      email: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
      username: ERROR_MESSAGES.USERNAME_TAKEN,
    }
    const message = friendlyMessages[field] || "This is already in use. Please try something else"
    throw new ConflictException(message)
  }

  /**
   * Throws a 401 error for authentication failures.
   *
   * Use this when credentials are invalid or missing.
   * Message is friendly and doesn't reveal why authentication failed.
   *
   * @param message - Optional custom message (defaults to friendly message)
   */
  static unauthorized(message = "Please log in to continue"): never {
    throw new UnauthorizedException(message)
  }

  /**
   * Domain-specific error: Wallet frozen
   *
   * Use this in wallet operations when a wallet is frozen.
   * Message is friendly and doesn't accuse the user.
   */
  static walletFrozen(): never {
    throw new BadRequestException(ERROR_MESSAGES.WALLET_FROZEN)
  }

  /**
   * Domain-specific error: Insufficient balance
   *
   * Use this in wallet operations when balance is too low.
   * Message is friendly and doesn't expose exact amounts.
   *
   * @param available - Current balance available (not shown to user)
   * @param required - Amount needed (not shown to user)
   */
  static insufficientBalance(available: number, required: number): never {
    throw new BadRequestException(ERROR_MESSAGES.INSUFFICIENT_BALANCE)
  }

  /**
   * Domain-specific error: Slot not available
   *
   * Use this in booking operations when a time slot is taken.
   * Message is friendly and apologetic.
   */
  static slotNotAvailable(): never {
    throw new BadRequestException(ERROR_MESSAGES.SLOT_NOT_AVAILABLE)
  }

  /**
   * Domain-specific error: Content already published
   *
   * Use this when trying to edit published content.
   * Message explains the limitation in a friendly way.
   */
  static contentAlreadyPublished(): never {
    throw new BadRequestException(ERROR_MESSAGES.CONTENT_ALREADY_PUBLISHED)
  }

  /**
   * Domain-specific error: Invalid status transition
   *
   * Use this when a status update is not allowed.
   * Message is friendly and doesn't expose technical status names.
   *
   * @param currentStatus - The current status (not shown to user)
   * @param attemptedStatus - The status they tried to set (not shown to user)
   */
  static invalidStatusTransition(currentStatus: string, attemptedStatus: string): never {
    throw new BadRequestException(ERROR_MESSAGES.INVALID_STATUS_TRANSITION)
  }
}
