/**
 * BlockRepository - Abstraction for Block entity database operations
 */
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, FindOptionsWhere, FindManyOptions } from "typeorm"
import { Block } from "../entities/block.entity"

@Injectable()
export class BlockRepository {
  constructor(
    @InjectRepository(Block)
    private readonly repository: Repository<Block>,
  ) {}

  async find(options: FindManyOptions<Block>): Promise<Block[]> {
    return this.repository.find(options)
  }

  async findOne(options: { where: FindOptionsWhere<Block>; relations?: string[] }): Promise<Block | null> {
    return this.repository.findOne(options)
  }

  async findAndCount(options: FindManyOptions<Block>): Promise<[Block[], number]> {
    return this.repository.findAndCount(options)
  }

  create(data: Partial<Block>): Block {
    return this.repository.create(data)
  }

  async save(block: Block): Promise<Block> {
    return this.repository.save(block)
  }

  async remove(block: Block): Promise<Block> {
    return this.repository.remove(block)
  }
}
