/**
 * TalentProfileRepository - Abstracts all TalentProfile entity database operations
 */
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { TalentProfile } from "../entities/talent-profile.entity"
import { ErrorHandler } from "../../common/exceptions/error.handler"
import { ERROR_MESSAGES } from "../../common/constants/error-messages.constant"

@Injectable()
export class TalentProfileRepository {
  constructor(
    @InjectRepository(TalentProfile)
    private repository: Repository<TalentProfile>,
  ) {}

  async findByUserId(userId: string): Promise<TalentProfile> {
    const profile = await this.repository.findOne({
      where: { userId },
      relations: ["user"],
    })
    if (!profile) {
      ErrorHandler.notFound(ERROR_MESSAGES.USER_NOT_FOUND)
    }
    return profile
  }

  async findByUserIdOptional(userId: string): Promise<TalentProfile | null> {
    return this.repository.findOne({ where: { userId } })
  }

  async save(profile: TalentProfile): Promise<TalentProfile> {
    return this.repository.save(profile)
  }

  async create(profileData: Partial<TalentProfile>): Promise<TalentProfile> {
    const profile = this.repository.create(profileData)
    return this.repository.save(profile)
  }

  async searchTalents(
    query?: string,
    skills?: string[],
    categories?: string[],
    page = 1,
    limit = 20,
    excludeUserId?: string,
  ): Promise<[TalentProfile[], number]> {
    const queryBuilder = this.repository
      .createQueryBuilder("talent")
      .innerJoinAndSelect("talent.user", "user")
      .where("talent.isBookable = :isBookable", { isBookable: true })
      .andWhere("user.isActive = :isActive", { isActive: true })

    if (excludeUserId) {
      queryBuilder.andWhere("user.id != :excludeUserId", { excludeUserId })
    }

    if (query) {
      queryBuilder.andWhere(
        "(user.displayName ILIKE :query OR user.username ILIKE :query OR user.bio ILIKE :query)",
        { query: `%${query}%` },
      )
    }

    // Filter by talent profile categories, not user.interests.
    // user.interests is a general list of hobbies — nearly every user picks 10+.
    // talent.categories is the specific list of talent types the artist offers
    // (e.g. ["Comedy", "Acting"]), which is what the bookings filter should match.
    //
    // We use LOWER() on both sides so the comparison is case-insensitive —
    // "Music" matches "music", "MUSIC", etc. This prevents mismatches when
    // categories were saved with different casing than the frontend filter pills.
    const categoryList = categories ? (Array.isArray(categories) ? categories : [categories]) : []
    if (categoryList.length > 0) {
      const categoryConditions = categoryList.map(
        (_, i) => `EXISTS (SELECT 1 FROM jsonb_array_elements_text(talent.categories::jsonb) AS elem WHERE LOWER(elem) = LOWER(:cat${i}))`,
      )
      const categoryParams: Record<string, string> = {}
      categoryList.forEach((cat, i) => {
        categoryParams[`cat${i}`] = cat
      })
      queryBuilder.andWhere(`(${categoryConditions.join(" OR ")})`, categoryParams)
    }

    return queryBuilder
      .orderBy("user.followersCount", "DESC")
      .addOrderBy("user.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()
  }
}
