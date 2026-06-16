/**
 * CommentLikeRepository - Abstraction for CommentLike entity database operations
 */
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, FindOptionsWhere, SelectQueryBuilder } from "typeorm"
import { CommentLike } from "../entities/comment-like.entity"

@Injectable()
export class CommentLikeRepository {
  constructor(
    @InjectRepository(CommentLike)
    private readonly repository: Repository<CommentLike>,
  ) {}

  async find(options: { where: FindOptionsWhere<CommentLike> }): Promise<CommentLike[]> {
    return this.repository.find(options)
  }

  async findOne(options: { where: FindOptionsWhere<CommentLike>; relations?: string[] }): Promise<CommentLike | null> {
    return this.repository.findOne(options)
  }

  create(data: Partial<CommentLike>): CommentLike {
    return this.repository.create(data)
  }

  async save(like: CommentLike): Promise<CommentLike> {
    return this.repository.save(like)
  }

  async remove(like: CommentLike): Promise<CommentLike> {
    return this.repository.remove(like)
  }

  createQueryBuilder(): SelectQueryBuilder<CommentLike> {
    return this.repository.createQueryBuilder()
  }
}
