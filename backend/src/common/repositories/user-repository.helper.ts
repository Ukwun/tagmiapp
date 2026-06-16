/**
 * UserRepositoryHelper
 *
 * Centralizes all user fetching patterns used across the backend.
 * When any service needs to load a user by ID, email, or username,
 * it calls this helper instead of writing its own query.
 *
 * This helper does NOT handle user creation, updates, or deletion.
 * Those operations belong in UsersService where business rules apply.
 *
 * It does NOT filter sensitive fields — that is UserTransformer's job.
 *
 * Used by: auth, content, bookings, chat, notifications, wallet services.
 */
import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, In } from "typeorm"
import { User } from "../../users/entities/user.entity"

@Injectable()
export class UserRepositoryHelper {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Finds a user by ID and throws an error if not found.
   *
   * Use this when the user MUST exist for the operation to proceed.
   * For example, when processing a booking for a customer — if the
   * customer does not exist, the entire operation should fail loudly.
   *
   * @param id - The user's unique identifier
   * @param relations - Optional relations to load (e.g., ['talentProfile', 'wallet'])
   * @throws NotFoundException if user does not exist
   * @returns The user object with requested relations
   */
  async findByIdOrFail(id: string, relations: string[] = []): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations,
    })

    if (!user) {
      throw new NotFoundException("User not found")
    }

    return user
  }

  /**
   * Finds a user by ID and returns null if not found.
   *
   * Use this when the user's absence is a valid scenario you need to handle.
   * For example, checking if a username is taken — null means it is free.
   *
   * @param id - The user's unique identifier
   * @param relations - Optional relations to load
   * @returns User object or null
   */
  async findById(id: string, relations: string[] = []): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations,
    })
  }

  /**
   * Finds a user by username.
   *
   * Used during login and username availability checks.
   * Usernames are unique in the database, so this returns one user or null.
   *
   * @param username - The username to search for
   * @returns User object or null
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username },
    })
  }

  /**
   * Finds a user by email.
   *
   * Used during login and registration checks.
   * Emails are unique, so this returns one user or null.
   *
   * @param email - The email address to search for
   * @returns User object or null
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    })
  }

  /**
   * Finds multiple users by their IDs in one query.
   *
   * This is far more efficient than calling findById in a loop.
   * Used when loading followers, mentioned users, or chat room members.
   *
   * @param ids - Array of user IDs
   * @param relations - Optional relations to load
   * @returns Array of users (may be shorter than ids if some users don't exist)
   */
  async findByIds(ids: string[], relations: string[] = []): Promise<User[]> {
    if (ids.length === 0) return []

    return this.userRepository.find({
      where: { id: In(ids) },
      relations,
    })
  }

  /**
   * Checks if a user exists without loading the full object.
   *
   * Use this when you only need to know IF a user exists, not their data.
   * Much faster than fetching the user and checking for null.
   *
   * @param id - The user ID to check
   * @returns true if user exists, false otherwise
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.userRepository.count({ where: { id } })
    return count > 0
  }
}
