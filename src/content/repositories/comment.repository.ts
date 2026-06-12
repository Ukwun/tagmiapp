/**
 * CommentRepository - Abstraction for Comment entity database operations
 */
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, FindOptionsWhere, FindManyOptions, SelectQueryBuilder } from "typeorm"
import { Comment } from "../entities/comment.entity"

@Injectable()
export class CommentRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly repository: Repository<Comment>,
  ) {}

  async find(options: FindManyOptions<Comment>): Promise<Comment[]> {
    return this.repository.find(options)
  }

  async findOne(options: { where: FindOptionsWhere<Comment>; relations?: string[] }): Promise<Comment | null> {
    return this.repository.findOne(options)
  }

  async findAndCount(options: FindManyOptions<Comment>): Promise<[Comment[], number]> {
    return this.repository.findAndCount(options)
  }

  create(data: Partial<Comment>): Comment {
    return this.repository.create(data)
  }

  async save(comment: Comment): Promise<Comment> {
    return this.repository.save(comment)
  }

  async remove(comment: Comment): Promise<Comment> {
    return this.repository.remove(comment)
  }

  createQueryBuilder(): SelectQueryBuilder<Comment> {
    return this.repository.createQueryBuilder()
  }
}
