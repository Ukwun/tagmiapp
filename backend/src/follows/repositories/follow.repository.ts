/**
 * FollowRepository - Abstraction for Follow entity database operations
 */
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, FindOptionsWhere, FindManyOptions, SelectQueryBuilder } from "typeorm"
import { Follow } from "../entities/follow.entity"

@Injectable()
export class FollowRepository {
  constructor(
    @InjectRepository(Follow)
    private readonly repository: Repository<Follow>,
  ) {}

  async find(options: FindManyOptions<Follow>): Promise<Follow[]> {
    return this.repository.find(options)
  }

  async findOne(options: { where: FindOptionsWhere<Follow>; relations?: string[] }): Promise<Follow | null> {
    return this.repository.findOne(options)
  }

  async findAndCount(options: FindManyOptions<Follow>): Promise<[Follow[], number]> {
    return this.repository.findAndCount(options)
  }

  create(data: Partial<Follow>): Follow {
    return this.repository.create(data)
  }

  async save(follow: Follow): Promise<Follow> {
    return this.repository.save(follow)
  }

  async remove(follow: Follow): Promise<Follow> {
    return this.repository.remove(follow)
  }

  createQueryBuilder(alias: string): SelectQueryBuilder<Follow> {
    return this.repository.createQueryBuilder(alias)
  }

  async count(options?: FindManyOptions<Follow>): Promise<number> {
    return this.repository.count(options)
  }
}
