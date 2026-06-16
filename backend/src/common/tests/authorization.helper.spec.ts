/**
 * AuthorizationHelper Tests
 *
 * Tests all ownership and permission checks to ensure they throw
 * ForbiddenException when authorization fails.
 */
import { ForbiddenException } from "@nestjs/common"
import { AuthorizationHelper } from "../guards/authorization.helper"

describe("AuthorizationHelper", () => {
  describe("verifyOwnership", () => {
    it("should not throw when user owns the resource", () => {
      // ARRANGE — user ID matches resource owner ID
      const resourceOwnerId = "user-1"
      const userId = "user-1"

      // ACT + ASSERT — should not throw
      expect(() => {
        AuthorizationHelper.verifyOwnership(resourceOwnerId, userId)
      }).not.toThrow()
    })

    it("should throw ForbiddenException when user does not own the resource", () => {
      // ARRANGE — different user trying to access resource
      const resourceOwnerId = "user-1"
      const userId = "user-2"

      // ACT + ASSERT — should throw
      expect(() => {
        AuthorizationHelper.verifyOwnership(resourceOwnerId, userId)
      }).toThrow(ForbiddenException)
    })

    it("should include friendly default error message", () => {
      // ARRANGE
      const resourceOwnerId = "user-1"
      const userId = "user-2"

      // ACT + ASSERT — check error message
      expect(() => {
        AuthorizationHelper.verifyOwnership(resourceOwnerId, userId)
      }).toThrow("You don't have permission to do that")
    })

    it("should use custom error message when provided", () => {
      // ARRANGE
      const resourceOwnerId = "user-1"
      const userId = "user-2"
      const customMessage = "Only the author can edit this post"

      // ACT + ASSERT
      expect(() => {
        AuthorizationHelper.verifyOwnership(resourceOwnerId, userId, customMessage)
      }).toThrow(customMessage)
    })
  })

  describe("verifyOwnershipMultiple", () => {
    it("should not throw when user is one of the owners", () => {
      // ARRANGE — user is in the list of valid owners
      const resourceOwnerIds = ["user-1", "user-2", "user-3"]
      const userId = "user-2"

      // ACT + ASSERT — should not throw
      expect(() => {
        AuthorizationHelper.verifyOwnershipMultiple(resourceOwnerIds, userId)
      }).not.toThrow()
    })

    it("should throw when user is not in the owners list", () => {
      // ARRANGE — user trying to access is not an owner
      const resourceOwnerIds = ["user-1", "user-2"]
      const userId = "user-3"

      // ACT + ASSERT
      expect(() => {
        AuthorizationHelper.verifyOwnershipMultiple(resourceOwnerIds, userId)
      }).toThrow(ForbiddenException)
    })

    it("should work with single owner in array", () => {
      // ARRANGE — only one owner
      const resourceOwnerIds = ["user-1"]
      const userId = "user-1"

      // ACT + ASSERT
      expect(() => {
        AuthorizationHelper.verifyOwnershipMultiple(resourceOwnerIds, userId)
      }).not.toThrow()
    })

    it("should throw when owners array is empty", () => {
      // ARRANGE — no owners (edge case)
      const resourceOwnerIds: string[] = []
      const userId = "user-1"

      // ACT + ASSERT — user cannot be in empty array
      expect(() => {
        AuthorizationHelper.verifyOwnershipMultiple(resourceOwnerIds, userId)
      }).toThrow(ForbiddenException)
    })
  })

  describe("verifyMembership", () => {
    it("should not throw when user is a member", () => {
      // ARRANGE — user is in the member list
      const memberIds = ["user-1", "user-2", "user-3"]
      const userId = "user-2"

      // ACT + ASSERT
      expect(() => {
        AuthorizationHelper.verifyMembership(memberIds, userId)
      }).not.toThrow()
    })

    it("should throw when user is not a member", () => {
      // ARRANGE — user trying to access is not a member
      const memberIds = ["user-1", "user-2"]
      const userId = "user-3"

      // ACT + ASSERT
      expect(() => {
        AuthorizationHelper.verifyMembership(memberIds, userId)
      }).toThrow(ForbiddenException)
    })

    it("should use friendly membership error message", () => {
      // ARRANGE
      const memberIds = ["user-1"]
      const userId = "user-2"

      // ACT + ASSERT — check default message
      expect(() => {
        AuthorizationHelper.verifyMembership(memberIds, userId)
      }).toThrow("You need to join this group first")
    })

    it("should accept custom error message", () => {
      // ARRANGE
      const memberIds = ["user-1"]
      const userId = "user-2"
      const customMessage = "You must join the chat room first"

      // ACT + ASSERT
      expect(() => {
        AuthorizationHelper.verifyMembership(memberIds, userId, customMessage)
      }).toThrow(customMessage)
    })
  })

  describe("verifyAdmin", () => {
    it("should not throw when user is admin", () => {
      // ARRANGE — user has admin role
      const userRole = "admin"

      // ACT + ASSERT
      expect(() => {
        AuthorizationHelper.verifyAdmin(userRole)
      }).not.toThrow()
    })

    it("should throw when user is not admin", () => {
      // ARRANGE — user has regular role
      const userRole = "client"

      // ACT + ASSERT
      expect(() => {
        AuthorizationHelper.verifyAdmin(userRole)
      }).toThrow(ForbiddenException)
    })

    it("should throw for talent role", () => {
      // ARRANGE — talent is not admin
      const userRole = "talent"

      // ACT + ASSERT
      expect(() => {
        AuthorizationHelper.verifyAdmin(userRole)
      }).toThrow(ForbiddenException)
    })

    it("should use friendly admin error message", () => {
      // ARRANGE
      const userRole = "client"

      // ACT + ASSERT
      expect(() => {
        AuthorizationHelper.verifyAdmin(userRole)
      }).toThrow("You don't have permission to do that")
    })

    it("should accept custom error message", () => {
      // ARRANGE
      const userRole = "client"
      const customMessage = "This operation requires administrator privileges"

      // ACT + ASSERT
      expect(() => {
        AuthorizationHelper.verifyAdmin(userRole, customMessage)
      }).toThrow(customMessage)
    })
  })
})
