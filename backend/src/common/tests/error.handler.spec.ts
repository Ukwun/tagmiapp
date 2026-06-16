/**
 * ErrorHandler Tests
 *
 * Tests all error throwing methods to ensure they generate
 * consistent error messages and throw the correct exception types.
 */
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  UnauthorizedException,
} from "@nestjs/common"
import { ErrorHandler } from "../exceptions/error.handler"

describe("ErrorHandler", () => {
  describe("notFound", () => {
    it("should throw NotFoundException with resource name", () => {
      // ARRANGE
      const resource = "User"

      // ACT + ASSERT
      expect(() => {
        ErrorHandler.notFound(resource)
      }).toThrow(NotFoundException)
      expect(() => {
        ErrorHandler.notFound(resource)
      }).toThrow("We couldn't find that user")
    })

    it("should use friendly message when identifier is provided", () => {
      // ARRANGE
      const resource = "Booking"
      const identifier = "booking-123"

      // ACT + ASSERT
      expect(() => {
        ErrorHandler.notFound(resource, identifier)
      }).toThrow("We couldn't find that booking")
    })

    it("should work with different resource types", () => {
      // ARRANGE + ACT + ASSERT — all should throw with friendly messages
      expect(() => {
        ErrorHandler.notFound("Content")
      }).toThrow("This post is no longer available")

      expect(() => {
        ErrorHandler.notFound("Comment")
      }).toThrow("This comment is no longer available")

      expect(() => {
        ErrorHandler.notFound("Message")
      }).toThrow("This message is no longer available")
    })
  })

  describe("forbidden", () => {
    it("should throw ForbiddenException with friendly message", () => {
      // ARRANGE
      const action = "delete"

      // ACT + ASSERT
      expect(() => {
        ErrorHandler.forbidden(action)
      }).toThrow(ForbiddenException)
      expect(() => {
        ErrorHandler.forbidden(action)
      }).toThrow("You don't have permission to do that")
    })

    it("should use same friendly message regardless of resource", () => {
      // ARRANGE
      const action = "edit"
      const resource = "post"

      // ACT + ASSERT
      expect(() => {
        ErrorHandler.forbidden(action, resource)
      }).toThrow("You don't have permission to do that")
    })
  })

  describe("badRequest", () => {
    it("should throw BadRequestException with custom message", () => {
      // ARRANGE
      const message = "Invalid email format"

      // ACT + ASSERT
      expect(() => {
        ErrorHandler.badRequest(message)
      }).toThrow(BadRequestException)
      expect(() => {
        ErrorHandler.badRequest(message)
      }).toThrow(message)
    })

    it("should preserve exact message text", () => {
      // ARRANGE
      const message = "Password must be at least 8 characters"

      // ACT + ASSERT
      expect(() => {
        ErrorHandler.badRequest(message)
      }).toThrow(message)
    })
  })

  describe("conflict", () => {
    it("should throw ConflictException with friendly message for email", () => {
      // ARRANGE
      const resource = "User"
      const field = "email"
      const value = "test@example.com"

      // ACT + ASSERT
      expect(() => {
        ErrorHandler.conflict(resource, field, value)
      }).toThrow(ConflictException)
      expect(() => {
        ErrorHandler.conflict(resource, field, value)
      }).toThrow("This email is already in use. Please try another one")
    })

    it("should work with username conflicts", () => {
      // ARRANGE
      const resource = "User"
      const field = "username"
      const value = "johndoe"

      // ACT + ASSERT
      expect(() => {
        ErrorHandler.conflict(resource, field, value)
      }).toThrow("This username is already taken. Please try another one")
    })
  })

  describe("unauthorized", () => {
    it("should throw UnauthorizedException with friendly default message", () => {
      // ARRANGE — no custom message

      // ACT + ASSERT
      expect(() => {
        ErrorHandler.unauthorized()
      }).toThrow(UnauthorizedException)
      expect(() => {
        ErrorHandler.unauthorized()
      }).toThrow("Please log in to continue")
    })

    it("should use custom message when provided", () => {
      // ARRANGE
      const customMessage = "Token has expired"

      // ACT + ASSERT
      expect(() => {
        ErrorHandler.unauthorized(customMessage)
      }).toThrow(customMessage)
    })
  })

  describe("walletFrozen", () => {
    it("should throw BadRequestException with friendly message", () => {
      // ARRANGE — wallet frozen due to fraud

      // ACT + ASSERT
      expect(() => {
        ErrorHandler.walletFrozen()
      }).toThrow(BadRequestException)
      expect(() => {
        ErrorHandler.walletFrozen()
      }).toThrow("Your wallet is temporarily unavailable. Please contact support for assistance")
    })
  })

  describe("insufficientBalance", () => {
    it("should throw BadRequestException with friendly message", () => {
      // ARRANGE
      const available = 50
      const required = 100

      // ACT + ASSERT
      expect(() => {
        ErrorHandler.insufficientBalance(available, required)
      }).toThrow(BadRequestException)
      expect(() => {
        ErrorHandler.insufficientBalance(available, required)
      }).toThrow("You don't have enough credits for this action")
    })

    it("should use same friendly message regardless of amounts", () => {
      // ARRANGE
      const available = 0
      const required = 25

      // ACT + ASSERT
      expect(() => {
        ErrorHandler.insufficientBalance(available, required)
      }).toThrow("You don't have enough credits for this action")
    })
  })

  describe("slotNotAvailable", () => {
    it("should throw BadRequestException with friendly message", () => {
      // ARRANGE — booking slot already taken

      // ACT + ASSERT
      expect(() => {
        ErrorHandler.slotNotAvailable()
      }).toThrow(BadRequestException)
      expect(() => {
        ErrorHandler.slotNotAvailable()
      }).toThrow("Sorry, this time slot was just booked by someone else. Please choose another time")
    })
  })

  describe("contentAlreadyPublished", () => {
    it("should throw BadRequestException with friendly message", () => {
      // ARRANGE — trying to edit published content

      // ACT + ASSERT
      expect(() => {
        ErrorHandler.contentAlreadyPublished()
      }).toThrow(BadRequestException)
      expect(() => {
        ErrorHandler.contentAlreadyPublished()
      }).toThrow("This post has already been published and can't be edited")
    })
  })

  describe("invalidStatusTransition", () => {
    it("should throw BadRequestException with friendly message", () => {
      // ARRANGE
      const currentStatus = "completed"
      const attemptedStatus = "pending"

      // ACT + ASSERT
      expect(() => {
        ErrorHandler.invalidStatusTransition(currentStatus, attemptedStatus)
      }).toThrow(BadRequestException)
      expect(() => {
        ErrorHandler.invalidStatusTransition(currentStatus, attemptedStatus)
      }).toThrow("This action isn't available right now")
    })

    it("should use same friendly message for all transitions", () => {
      // ARRANGE
      const currentStatus = "cancelled"
      const attemptedStatus = "in_progress"

      // ACT + ASSERT
      expect(() => {
        ErrorHandler.invalidStatusTransition(currentStatus, attemptedStatus)
      }).toThrow("This action isn't available right now")
    })
  })
})
