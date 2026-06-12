/**
 * UserTransformer Tests
 *
 * Tests user data sanitization to ensure sensitive fields are removed
 * and public profiles contain only allowed data.
 */
import { UserTransformer } from "../transformers/user.transformer"
import { User } from "../../users/entities/user.entity"

describe("UserTransformer", () => {
  describe("sanitize", () => {
    it("should remove passwordHash from user object", () => {
      // ARRANGE — user with sensitive password hash
      const user = {
        id: "user-1",
        username: "johndoe",
        email: "john@example.com",
        passwordHash: "hashed_password_12345",
      } as User

      // ACT — sanitize the user
      const result = UserTransformer.sanitize(user)

      // ASSERT — passwordHash should be gone
      expect(result).toHaveProperty("id")
      expect(result).toHaveProperty("username")
      expect(result).toHaveProperty("email")
      expect(result).not.toHaveProperty("passwordHash")
    })

    it("should return null when user is null", () => {
      // ARRANGE — null user
      const user = null

      // ACT
      const result = UserTransformer.sanitize(user)

      // ASSERT — should return null, not crash
      expect(result).toBeNull()
    })

    it("should return null when user is undefined", () => {
      // ARRANGE — undefined user
      const user = undefined

      // ACT
      const result = UserTransformer.sanitize(user)

      // ASSERT — should return null, not crash
      expect(result).toBeNull()
    })

    it("should preserve all non-sensitive fields", () => {
      // ARRANGE — user with many fields
      const user = {
        id: "user-1",
        username: "johndoe",
        email: "john@example.com",
        displayName: "John Doe",
        avatarUrl: "https://example.com/avatar.jpg",
        passwordHash: "hashed_password_12345",
        role: "client",
      } as User

      // ACT
      const result = UserTransformer.sanitize(user)

      // ASSERT — all safe fields preserved
      expect(result.id).toBe("user-1")
      expect(result.username).toBe("johndoe")
      expect(result.email).toBe("john@example.com")
      expect(result.displayName).toBe("John Doe")
      expect(result.avatarUrl).toBe("https://example.com/avatar.jpg")
      expect(result.role).toBe("client")
      expect(result).not.toHaveProperty("passwordHash")
    })
  })

  describe("sanitizeMany", () => {
    it("should sanitize array of users", () => {
      // ARRANGE — multiple users with password hashes
      const users = [
        { id: "user-1", username: "user1", passwordHash: "hash1" },
        { id: "user-2", username: "user2", passwordHash: "hash2" },
      ] as User[]

      // ACT
      const result = UserTransformer.sanitizeMany(users)

      // ASSERT — all users sanitized
      expect(result).toHaveLength(2)
      expect(result[0]).not.toHaveProperty("passwordHash")
      expect(result[1]).not.toHaveProperty("passwordHash")
      expect(result[0].username).toBe("user1")
      expect(result[1].username).toBe("user2")
    })

    it("should filter out null values", () => {
      // ARRANGE — array with null user
      const users = [
        { id: "user-1", username: "user1", passwordHash: "hash1" } as User,
        null as any,
      ]

      // ACT
      const result = UserTransformer.sanitizeMany(users)

      // ASSERT — null filtered out
      expect(result).toHaveLength(1)
      expect(result[0].username).toBe("user1")
    })

    it("should return empty array when given empty array", () => {
      // ARRANGE — empty array
      const users: User[] = []

      // ACT
      const result = UserTransformer.sanitizeMany(users)

      // ASSERT — empty array returned
      expect(result).toEqual([])
    })
  })

  describe("toPublicProfile", () => {
    it("should extract only public profile fields", () => {
      // ARRANGE — user with many fields
      const user = {
        id: "user-1",
        username: "johndoe",
        displayName: "John Doe",
        avatarUrl: "https://example.com/avatar.jpg",
        email: "john@example.com", // should NOT be in public profile
        passwordHash: "hashed_password", // should NOT be in public profile
        role: "client", // should NOT be in public profile
      } as User

      // ACT
      const result = UserTransformer.toPublicProfile(user)

      // ASSERT — only public fields included
      expect(result.id).toBe("user-1")
      expect(result.username).toBe("johndoe")
      expect(result.displayName).toBe("John Doe")
      expect(result.avatarUrl).toBe("https://example.com/avatar.jpg")
      expect(result).not.toHaveProperty("email")
      expect(result).not.toHaveProperty("passwordHash")
      expect(result).not.toHaveProperty("role")
    })

    it("should handle missing avatarUrl", () => {
      // ARRANGE — user without avatar
      const user = {
        id: "user-1",
        username: "johndoe",
        displayName: "John Doe",
        avatarUrl: null,
      } as User

      // ACT
      const result = UserTransformer.toPublicProfile(user)

      // ASSERT — avatarUrl is null
      expect(result.avatarUrl).toBeNull()
    })
  })
})
