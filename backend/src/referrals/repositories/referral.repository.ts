import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, FindManyOptions, FindOptionsWhere, FindOneOptions, SelectQueryBuilder } from "typeorm"
import { Referral } from "../entities/referral.entity"

@Injectable()
export class ReferralRepository {
  constructor(
    @InjectRepository(Referral)
    private readonly repository: Repository<Referral>,
  ) {}

  async find(options: FindManyOptions<Referral>): Promise<Referral[]> {
    return this.repository.find(options)
  }

  async findOne(options: FindOneOptions<Referral>): Promise<Referral | null> {
    return this.repository.findOne(options)
  }

  async findAndCount(options: FindManyOptions<Referral>): Promise<[Referral[], number]> {
    return this.repository.findAndCount(options)
  }

  async count(options?: FindManyOptions<Referral>): Promise<number> {
    return this.repository.count(options)
  }

  create(data: Partial<Referral>): Referral {
    return this.repository.create(data)
  }

  async save(referral: Referral): Promise<Referral> {
    return this.repository.save(referral)
  }

  async remove(referral: Referral): Promise<Referral> {
    return this.repository.remove(referral)
  }

  async update(criteria: any, updates: Partial<Referral>): Promise<void> {
    await this.repository.update(criteria, updates)
  }

  createQueryBuilder(alias: string): SelectQueryBuilder<Referral> {
    return this.repository.createQueryBuilder(alias)
  }

  get manager() {
    return this.repository.manager
  }
}
