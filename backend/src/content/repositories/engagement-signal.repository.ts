/**
 * EngagementSignalRepository - Abstraction for EngagementSignal entity database operations
 */
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, SelectQueryBuilder, FindManyOptions } from "typeorm"
import { EngagementSignal } from "../entities/engagement-signal.entity"

@Injectable()
export class EngagementSignalRepository {
  constructor(
    @InjectRepository(EngagementSignal)
    private readonly repository: Repository<EngagementSignal>,
  ) {}

  create(data: Partial<EngagementSignal>): EngagementSignal {
    return this.repository.create(data)
  }

  async save(signals: EngagementSignal[]): Promise<EngagementSignal[]> {
    return this.repository.save(signals)
  }

  createQueryBuilder(alias: string = "signal"): SelectQueryBuilder<EngagementSignal> {
    return this.repository.createQueryBuilder(alias)
  }

  async count(options?: FindManyOptions<EngagementSignal>): Promise<number> {
    return this.repository.count(options)
  }
}
