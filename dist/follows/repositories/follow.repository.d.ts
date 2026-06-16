import { Repository, FindOptionsWhere, FindManyOptions, SelectQueryBuilder } from "typeorm";
import { Follow } from "../entities/follow.entity";
export declare class FollowRepository {
    private readonly repository;
    constructor(repository: Repository<Follow>);
    find(options: FindManyOptions<Follow>): Promise<Follow[]>;
    findOne(options: {
        where: FindOptionsWhere<Follow>;
        relations?: string[];
    }): Promise<Follow | null>;
    findAndCount(options: FindManyOptions<Follow>): Promise<[Follow[], number]>;
    create(data: Partial<Follow>): Follow;
    save(follow: Follow): Promise<Follow>;
    remove(follow: Follow): Promise<Follow>;
    createQueryBuilder(alias: string): SelectQueryBuilder<Follow>;
    count(options?: FindManyOptions<Follow>): Promise<number>;
}
