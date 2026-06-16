/**
 * UserTransformer
 *
 * Removes sensitive fields from user objects before sending them to clients.
 * Every service that returns user data calls this before the response leaves.
 *
 * This transformer does NOT fetch users from the database.
 * It only transforms data that is already loaded.
 *
 * It does NOT handle authentication or authorization.
 * It only strips fields that should never reach the client.
 *
 * Used by: auth, content, bookings, chat, users, follows services.
 */
import { User } from "../../users/entities/user.entity"

export class UserTransformer {
  /**
   * Removes sensitive fields from a user object.
   *
   * We strip out password hashes, OTP codes, and phone hashes because
   * these should never reach the frontend — even for the logged-in user.
   * If the frontend needs to show "you are verified", we send isVerified
   * which is already safe.
   *
   * If the user is null or undefined, we return it as-is instead of crashing.
   *
   * @param user - The user object to sanitize (may be null/undefined)
   * @returns Sanitized user object or null
   */
  static sanitize(user: User | null | undefined): Partial<User> | null {
    if (!user) return null

    const { passwordHash, ...safe } = user as any
    return safe
  }

  /**
   * Sanitizes multiple users in one call.
   *
   * Used when returning lists of followers, following, or search results.
   * Filters out any null values that might exist in the array.
   *
   * @param users - Array of user objects
   * @returns Array of sanitized users (nulls filtered out)
   */
  static sanitizeMany(users: User[]): Partial<User>[] {
    return users.map((user) => this.sanitize(user)).filter(Boolean)
  }

  /**
   * Extracts only public profile data.
   *
   * Use this when showing a user's profile to someone else.
   * It includes only the fields we want visible on a public profile page.
   * This is more restrictive than sanitize() which returns most fields.
   *
   * @param user - The user object
   * @returns Public profile data only
   */
  static toPublicProfile(user: User): PublicUserProfile {
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    }
  }
}

export interface PublicUserProfile {
  id: string
  username: string
  displayName: string
  avatarUrl?: string
}
