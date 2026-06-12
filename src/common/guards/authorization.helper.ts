/**
 * AuthorizationHelper
 *
 * Centralizes ownership and permission checks across the backend.
 * When a service needs to verify a user owns a resource, it calls
 * this helper instead of writing its own if-statement.
 *
 * This helper does NOT authenticate users — that is JwtAuthGuard's job.
 * It only checks permissions AFTER we know who the user is.
 *
 * It does NOT fetch resources from the database.
 * Services must load the resource first, then verify ownership.
 *
 * Used by: content, bookings, chat, wallet services.
 */
import { ForbiddenException } from "@nestjs/common"

export class AuthorizationHelper {
  /**
   * Verifies a user owns a resource.
   *
   * Use this when only the resource owner should proceed.
   * For example, only the author can edit their own post.
   *
   * We throw immediately instead of returning a boolean because
   * failed authorization should stop execution. The caller should
   * not need to check a return value and throw separately.
   *
   * @param resourceOwnerId - The ID of the user who owns the resource
   * @param userId - The ID of the user making the request
   * @param message - Custom error message (optional)
   * @throws ForbiddenException if user is not the owner
   */
  static verifyOwnership(
    resourceOwnerId: string,
    userId: string,
    message = "You don't have permission to do that",
  ): void {
    if (resourceOwnerId !== userId) {
      throw new ForbiddenException(message)
    }
  }

  /**
   * Verifies a user is one of multiple possible owners.
   *
   * Use this for resources with multiple stakeholders.
   * For example, a booking can be accessed by either the client or the talent.
   *
   * @param resourceOwnerIds - Array of user IDs who can access the resource
   * @param userId - The ID of the user making the request
   * @param message - Custom error message (optional)
   * @throws ForbiddenException if user is not among the owners
   */
  static verifyOwnershipMultiple(
    resourceOwnerIds: string[],
    userId: string,
    message = "You don't have permission to do that",
  ): void {
    if (!resourceOwnerIds.includes(userId)) {
      throw new ForbiddenException(message)
    }
  }

  /**
   * Verifies a user is a member of a group or room.
   *
   * Use this for chat rooms, groups, or any resource with a member list.
   *
   * @param memberIds - Array of member user IDs
   * @param userId - The ID of the user making the request
   * @param message - Custom error message (optional)
   * @throws ForbiddenException if user is not a member
   */
  static verifyMembership(
    memberIds: string[],
    userId: string,
    message = "You need to join this group first",
  ): void {
    if (!memberIds.includes(userId)) {
      throw new ForbiddenException(message)
    }
  }

  /**
   * Verifies a user has admin role.
   *
   * Use this in admin-only endpoints or operations.
   * The role check is simple but throwing here centralizes the logic
   * and ensures consistent error messages.
   *
   * @param userRole - The role of the user making the request
   * @param message - Custom error message (optional)
   * @throws ForbiddenException if user is not an admin
   */
  static verifyAdmin(userRole: string, message = "You don't have permission to do that"): void {
    if (userRole !== "admin") {
      throw new ForbiddenException(message)
    }
  }
}
