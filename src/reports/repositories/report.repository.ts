/**
 * ReportRepository - Abstraction for Report entity database operations
 */
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, FindManyOptions, FindOptionsWhere, SelectQueryBuilder } from "typeorm"
import { Report } from "../entities/report.entity"

@Injectable()
export class ReportRepository {
  constructor(
    @InjectRepository(Report)
    private readonly repository: Repository<Report>,
  ) {}

  async findAndCount(options: FindManyOptions<Report>): Promise<[Report[], number]> {
    return this.repository.findAndCount(options)
  }

  create(data: Partial<Report>): Report {
    return this.repository.create(data)
  }

  async save(report: Report): Promise<Report> {
    return this.repository.save(report)
  }

  async findOne(options: { where: FindOptionsWhere<Report>; relations?: string[] }): Promise<Report | null> {
    return this.repository.findOne(options)
  }

  async count(options?: FindManyOptions<Report>): Promise<number> {
    return this.repository.count(options)
  }

  async remove(report: Report): Promise<Report> {
    return this.repository.remove(report)
  }

  createQueryBuilder(alias: string): SelectQueryBuilder<Report> {
    return this.repository.createQueryBuilder(alias)
  }
}
