/**
 * DraftRepository - Abstraction for Draft entity database operations
 */
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, FindOptionsWhere, FindManyOptions } from "typeorm"
import { Draft } from "../entities/draft.entity"

@Injectable()
export class DraftRepository {
  constructor(
    @InjectRepository(Draft)
    private readonly repository: Repository<Draft>,
  ) {}

  async find(options: FindManyOptions<Draft>): Promise<Draft[]> {
    return this.repository.find(options)
  }

  async findOne(options: { where: FindOptionsWhere<Draft>; relations?: string[] }): Promise<Draft | null> {
    return this.repository.findOne(options)
  }

  create(data: Partial<Draft>): Draft {
    return this.repository.create(data)
  }

  async save(draft: Draft): Promise<Draft> {
    return this.repository.save(draft)
  }

  async remove(draft: Draft): Promise<Draft> {
    return this.repository.remove(draft)
  }
}
