/**
 * ContentInteractionRepository - Abstraction for ContentInteraction entity database operations
 */
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, FindOptionsWhere, FindManyOptions, SelectQueryBuilder } from "typeorm"
import { ContentInteraction } from "../entities/content-interaction.entity"

@Injectable()
export class ContentInteractionRepository {
  constructor(
    @InjectRepository(ContentInteraction)
    private readonly repository: Repository<ContentInteraction>,
  ) {}

  async find(options: FindManyOptions<ContentInteraction>): Promise<ContentInteraction[]> {
    return this.repository.find(options)
  }

  async findOne(options: any): Promise<ContentInteraction | null> {
    return this.repository.findOne(options)
  }

  async findAndCount(options: FindManyOptions<ContentInteraction>): Promise<[ContentInteraction[], number]> {
    return this.repository.findAndCount(options)
  }

  create(data: Partial<ContentInteraction>): ContentInteraction {
    return this.repository.create(data)
  }

  async save(interaction: ContentInteraction): Promise<ContentInteraction> {
    return this.repository.save(interaction)
  }

  async remove(interaction: ContentInteraction): Promise<ContentInteraction> {
    return this.repository.remove(interaction)
  }

  createQueryBuilder(alias: string = "interaction"): SelectQueryBuilder<ContentInteraction> {
    return this.repository.createQueryBuilder(alias)
  }

  async count(options?: FindManyOptions<ContentInteraction>): Promise<number> {
    return this.repository.count(options)
  }
}
