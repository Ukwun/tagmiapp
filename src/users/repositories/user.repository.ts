/**
 * UserRepository - Abstracts all User entity database operations
 */
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, ILike, SelectQueryBuilder, FindManyOptions, FindOptionsWhere } from "typeorm"
import { User } from "../entities/user.entity"
import { ErrorHandler } from "../../common/exceptions/error.handler"
import { ERROR_MESSAGES } from "../../common/constants/error-messages.constant"

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.repository.findOne({ where: { id } })
    if (!user) {
      ErrorHandler.notFound(ERROR_MESSAGES.USER_NOT_FOUND)
    }
    return user
  }

  async findByIdOptional(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } })
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.repository.findOne({ where: { username } })
    if (!user) {
      ErrorHandler.notFound(ERROR_MESSAGES.USER_NOT_FOUND)
    }
    return user
  }

  async findByUsernameOptional(username: string): Promise<User | null> {
    return this.repository.findOne({ where: { username } })
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email: ILike(email) } })
  }

  async findByEmailOrUsername(emailOrUsername: string): Promise<User | null> {
    const value = emailOrUsername.toLowerCase().trim()
    return this.repository.findOne({
      where: [{ email: ILike(value) }, { username: ILike(value) }],
    })
  }

  async findByEmailOrUsernameWithPassword(emailOrUsername: string): Promise<User | null> {
    const value = emailOrUsername.toLowerCase().trim()
    return this.repository.findOne({
      where: [{ email: ILike(value) }, { username: ILike(value) }],
      select: [
        "id",
        "email",
        "username",
        "displayName",
        "avatarUrl",
        "coverImageUrl",
        "bio",
        "gender",
        "dateOfBirth",
        "location",
        "interests",
        "role",
        "isVerified",
        "isActive",
        "createdAt",
        "passwordHash",
      ],
    })
  }

  async update(id: string, updates: Partial<User>): Promise<void> {
    await this.repository.update(id, updates)
  }

  async findByUsernames(usernames: string[]): Promise<User[]> {
    if (usernames.length === 0) {
      return []
    }
    return this.repository.find({
      where: usernames.map(username => ({ username })),
    })
  }

  async save(user: User): Promise<User> {
    return this.repository.save(user)
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData)
    return this.repository.save(user)
  }

  async searchUsers(query: string, limit: number): Promise<User[]> {
    return this.repository
      .createQueryBuilder("user")
      .where("user.isActive = :isActive", { isActive: true })
      .andWhere(
        "(user.username ILIKE :query OR user.displayName ILIKE :query)",
        { query: `%${query}%` },
      )
      .select([
        "user.id",
        "user.username",
        "user.displayName",
        "user.avatarUrl",
        "user.isVerified",
        "user.followersCount",
      ])
      .orderBy("user.followersCount", "DESC")
      .limit(limit)
      .getMany()
  }

  async findSuggestedUsers(excludeIds: string[], limit: number): Promise<User[]> {
    return this.repository
      .createQueryBuilder("user")
      .where("user.isActive = :isActive", { isActive: true })
      .andWhere("user.id NOT IN (:...excludeIds)", { excludeIds })
      .select([
        "user.id",
        "user.username",
        "user.displayName",
        "user.avatarUrl",
        "user.bio",
        "user.isVerified",
        "user.followersCount",
      ])
      .orderBy("user.followersCount", "DESC")
      .limit(limit)
      .getMany()
  }

  createQueryBuilder(alias: string): SelectQueryBuilder<User> {
    return this.repository.createQueryBuilder(alias)
  }

  async findOne(options: {
    where: FindOptionsWhere<User> | FindOptionsWhere<User>[]
    relations?: string[]
    select?: (keyof User)[]
  }): Promise<User | null> {
    return this.repository.findOne(options as any)
  }

  async count(options?: FindManyOptions<User>): Promise<number> {
    return this.repository.count(options)
  }

  async findByIds(ids: string[]): Promise<User[]> {
    if (ids.length === 0) {
      return []
    }
    return this.repository.find({
      where: ids.map(id => ({ id })),
    })
  }
}
