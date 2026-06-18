import { Repository, FindOptionsWhere, FindManyOptions } from "typeorm";
import { Block } from "../entities/block.entity";
export declare class BlockRepository {
    private readonly repository;
    constructor(repository: Repository<Block>);
    find(options: FindManyOptions<Block>): Promise<Block[]>;
    findOne(options: {
        where: FindOptionsWhere<Block>;
        relations?: string[];
    }): Promise<Block | null>;
    findAndCount(options: FindManyOptions<Block>): Promise<[Block[], number]>;
    create(data: Partial<Block>): Block;
    save(block: Block): Promise<Block>;
    remove(block: Block): Promise<Block>;
}
