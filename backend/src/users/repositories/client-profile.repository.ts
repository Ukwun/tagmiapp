/**
 * ClientProfileRepository - Abstracts all ClientProfile entity database operations
 */
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { ClientProfile } from "../entities/client-profile.entity"

@Injectable()
export class ClientProfileRepository {
  constructor(
    @InjectRepository(ClientProfile)
    private repository: Repository<ClientProfile>,
  ) {}

  async findByUserIdOptional(userId: string): Promise<ClientProfile | null> {
    return this.repository.findOne({ where: { userId } })
  }

  async save(profile: ClientProfile): Promise<ClientProfile> {
    return this.repository.save(profile)
  }

  async create(profileData: Partial<ClientProfile>): Promise<ClientProfile> {
    const profile = this.repository.create(profileData)
    return this.repository.save(profile)
  }
}
