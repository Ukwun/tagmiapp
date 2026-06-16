/**
 * UserSettingsRepository - Abstracts all UserSettings entity database operations
 */
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { UserSettings } from "../entities/user-settings.entity"

@Injectable()
export class UserSettingsRepository {
  constructor(
    @InjectRepository(UserSettings)
    private repository: Repository<UserSettings>,
  ) {}

  async findByUserIdOptional(userId: string): Promise<UserSettings | null> {
    return this.repository.findOne({ where: { userId } })
  }

  async save(settings: UserSettings): Promise<UserSettings> {
    return this.repository.save(settings)
  }

  async create(userId: string): Promise<UserSettings> {
    const settings = this.repository.create({ userId })
    return this.repository.save(settings)
  }
}
