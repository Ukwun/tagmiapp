/**
 * MentionRepository - Abstraction for Mention entity database operations
 */
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Mention } from "../entities/mention.entity"

@Injectable()
export class MentionRepository {
  constructor(
    @InjectRepository(Mention)
    private readonly repository: Repository<Mention>,
  ) {}

  async save(mentions: any[]): Promise<any[]> {
    return this.repository.save(mentions)
  }
}
