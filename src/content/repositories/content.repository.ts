/**
 * ContentRepository - Abstraction for Content entity database operations
 */
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, FindOptionsWhere, FindManyOptions, SelectQueryBuilder } from "typeorm"
import { Content } from "../entities/content.entity"

@Injectable()
export class ContentRepository {
  constructor(
    @InjectRepository(Content)
    private readonly repository: Repository<Content>,
  ) {}

  async find(options: FindManyOptions<Content>): Promise<Content[]> {
    return this.repository.find(options)
  }

  async findOne(options: { where: FindOptionsWhere<Content>; relations?: string[] }): Promise<Content | null> {
    return this.repository.findOne(options)
  }

  create(data: Partial<Content>): Content {
    return this.repository.create(data)
  }

  async save(content: Content): Promise<Content>
  async save(content: Content[]): Promise<Content[]>
  async save(content: Content | Content[]): Promise<Content | Content[]> {
    return this.repository.save(content as any)
  }

  async update(criteria: any, updates: Partial<Content>): Promise<void> {
    await this.repository.update(criteria, updates)
  }

  async remove(content: Content): Promise<Content>
  async remove(content: Content[]): Promise<Content[]>
  async remove(content: Content | Content[]): Promise<Content | Content[]> {
    return this.repository.remove(content as any)
  }

  createQueryBuilder(alias: string = "content"): SelectQueryBuilder<Content> {
    return this.repository.createQueryBuilder(alias)
  }

  async count(options: FindManyOptions<Content>): Promise<number> {
    return this.repository.count(options)
  }

  async query(sql: string, parameters?: any[]): Promise<any> {
    return this.repository.query(sql, parameters)
  }
}
