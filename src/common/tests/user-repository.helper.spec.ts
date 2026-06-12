/**
 * UserRepositoryHelper Tests
 *
 * Tests all user fetching patterns to ensure they work correctly
 * and throw the right errors when users are missing.
 */
import { Test, TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { NotFoundException } from "@nestjs/common"
import { UserRepositoryHelper } from "../repositories/user-repository.helper"
import { User } from "../../users/entities/user.entity"

describe("UserRepositoryHelper", () => {
  let helper: UserRepositoryHelper
  let userRepository: jest.Mocked<Repository<User>>

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepositoryHelper,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile()

    helper = module.get<UserRepositoryHelper>(UserRepositoryHelper)
    userRepository = module.get(getRepositoryToken(User))
  })

  describe("findByIdOrFail", () => {
    it("should return the user when they exist", async () => {
      // ARRANGE — set up a user that exists in the database
      const mockUser = {
        id: "user-1",
        username: "testuser",
        email: "test@example.com",
      } as User
      userRepository.findOne.mockResolvedValue(mockUser)

      // ACT — call the function
      const result = await helper.findByIdOrFail("user-1")

      // ASSERT — check we got the user back
      expect(result).toEqual(mockUser)
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: "user-1" },
        relations: [],
      })
    })

    it("should throw NotFoundException when user does not exist", async () => {
      // ARRANGE — set up a missing user
      userRepository.findOne.mockResolvedValue(null)

      // ACT + ASSERT — expect an error to be thrown
      await expect(helper.findByIdOrFail("fake-id")).rejects.toThrow(NotFoundException)
      await expect(helper.findByIdOrFail("fake-id")).rejects.toThrow("User not found")
    })

    it("should load relations when specified", async () => {
      // ARRANGE — set up a user with relations
      const mockUser = {
        id: "user-1",
        username: "testuser",
        talentProfile: { id: "profile-1" },
      } as User
      userRepository.findOne.mockResolvedValue(mockUser)

      // ACT — call with relations array
      const result = await helper.findByIdOrFail("user-1", ["talentProfile", "wallet"])

      // ASSERT — check relations were requested
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: "user-1" },
        relations: ["talentProfile", "wallet"],
      })
      expect(result).toEqual(mockUser)
    })
  })

  describe("findById", () => {
    it("should return the user when they exist", async () => {
      // ARRANGE
      const mockUser = {
        id: "user-1",
        username: "testuser",
      } as User
      userRepository.findOne.mockResolvedValue(mockUser)

      // ACT
      const result = await helper.findById("user-1")

      // ASSERT
      expect(result).toEqual(mockUser)
    })

    it("should return null when user does not exist", async () => {
      // ARRANGE
      userRepository.findOne.mockResolvedValue(null)

      // ACT
      const result = await helper.findById("fake-id")

      // ASSERT — no error, just null
      expect(result).toBeNull()
    })

    it("should load relations when specified", async () => {
      // ARRANGE
      const mockUser = { id: "user-1" } as User
      userRepository.findOne.mockResolvedValue(mockUser)

      // ACT
      await helper.findById("user-1", ["settings"])

      // ASSERT
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: "user-1" },
        relations: ["settings"],
      })
    })
  })

  describe("findByUsername", () => {
    it("should return user when username exists", async () => {
      // ARRANGE
      const mockUser = {
        id: "user-1",
        username: "johndoe",
      } as User
      userRepository.findOne.mockResolvedValue(mockUser)

      // ACT
      const result = await helper.findByUsername("johndoe")

      // ASSERT
      expect(result).toEqual(mockUser)
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { username: "johndoe" },
      })
    })

    it("should return null when username does not exist", async () => {
      // ARRANGE
      userRepository.findOne.mockResolvedValue(null)

      // ACT
      const result = await helper.findByUsername("nonexistent")

      // ASSERT
      expect(result).toBeNull()
    })
  })

  describe("findByEmail", () => {
    it("should return user when email exists", async () => {
      // ARRANGE
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
      } as User
      userRepository.findOne.mockResolvedValue(mockUser)

      // ACT
      const result = await helper.findByEmail("test@example.com")

      // ASSERT
      expect(result).toEqual(mockUser)
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      })
    })

    it("should return null when email does not exist", async () => {
      // ARRANGE
      userRepository.findOne.mockResolvedValue(null)

      // ACT
      const result = await helper.findByEmail("fake@example.com")

      // ASSERT
      expect(result).toBeNull()
    })
  })

  describe("findByIds", () => {
    it("should return multiple users in one query", async () => {
      // ARRANGE — multiple users exist
      const mockUsers = [
        { id: "user-1", username: "user1" },
        { id: "user-2", username: "user2" },
      ] as User[]
      userRepository.find.mockResolvedValue(mockUsers)

      // ACT
      const result = await helper.findByIds(["user-1", "user-2"])

      // ASSERT — all users returned
      expect(result).toEqual(mockUsers)
      expect(userRepository.find).toHaveBeenCalledWith({
        where: { id: expect.anything() },
        relations: [],
      })
    })

    it("should return empty array when given empty ID list", async () => {
      // ARRANGE — empty array
      const ids: string[] = []

      // ACT
      const result = await helper.findByIds(ids)

      // ASSERT — no query made, just return empty
      expect(result).toEqual([])
      expect(userRepository.find).not.toHaveBeenCalled()
    })

    it("should load relations when specified", async () => {
      // ARRANGE
      const mockUsers = [{ id: "user-1" }] as User[]
      userRepository.find.mockResolvedValue(mockUsers)

      // ACT
      await helper.findByIds(["user-1"], ["talentProfile"])

      // ASSERT
      expect(userRepository.find).toHaveBeenCalledWith({
        where: { id: expect.anything() },
        relations: ["talentProfile"],
      })
    })

    it("should handle when some users in the list don't exist", async () => {
      // ARRANGE — request 3 users but only 2 exist
      const mockUsers = [
        { id: "user-1", username: "user1" },
        { id: "user-2", username: "user2" },
      ] as User[]
      userRepository.find.mockResolvedValue(mockUsers)

      // ACT
      const result = await helper.findByIds(["user-1", "user-2", "user-3"])

      // ASSERT — only 2 users returned, no error
      expect(result).toHaveLength(2)
      expect(result).toEqual(mockUsers)
    })
  })

  describe("exists", () => {
    it("should return true when user exists", async () => {
      // ARRANGE
      userRepository.count.mockResolvedValue(1)

      // ACT
      const result = await helper.exists("user-1")

      // ASSERT
      expect(result).toBe(true)
      expect(userRepository.count).toHaveBeenCalledWith({
        where: { id: "user-1" },
      })
    })

    it("should return false when user does not exist", async () => {
      // ARRANGE
      userRepository.count.mockResolvedValue(0)

      // ACT
      const result = await helper.exists("fake-id")

      // ASSERT
      expect(result).toBe(false)
    })
  })
})
