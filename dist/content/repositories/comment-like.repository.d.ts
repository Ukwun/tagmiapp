import { Repository, FindOptionsWhere, SelectQueryBuilder } from "typeorm";
import { CommentLike } from "../entities/comment-like.entity";
export declare class CommentLikeRepository {
    private readonly repository;
    constructor(repository: Repository<CommentLike>);
    find(options: {
        where: FindOptionsWhere<CommentLike>;
    }): Promise<CommentLike[]>;
    findOne(options: {
        where: FindOptionsWhere<CommentLike>;
        relations?: string[];
    }): Promise<CommentLike | null>;
    create(data: Partial<CommentLike>): CommentLike;
    save(like: CommentLike): Promise<CommentLike>;
    remove(like: CommentLike): Promise<CommentLike>;
    createQueryBuilder(): SelectQueryBuilder<CommentLike>;
}
