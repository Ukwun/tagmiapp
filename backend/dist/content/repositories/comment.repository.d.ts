import { Repository, FindOptionsWhere, FindManyOptions, SelectQueryBuilder } from "typeorm";
import { Comment } from "../entities/comment.entity";
export declare class CommentRepository {
    private readonly repository;
    constructor(repository: Repository<Comment>);
    find(options: FindManyOptions<Comment>): Promise<Comment[]>;
    findOne(options: {
        where: FindOptionsWhere<Comment>;
        relations?: string[];
    }): Promise<Comment | null>;
    findAndCount(options: FindManyOptions<Comment>): Promise<[Comment[], number]>;
    create(data: Partial<Comment>): Comment;
    save(comment: Comment): Promise<Comment>;
    remove(comment: Comment): Promise<Comment>;
    createQueryBuilder(): SelectQueryBuilder<Comment>;
}
