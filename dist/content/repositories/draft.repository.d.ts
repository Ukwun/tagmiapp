import { Repository, FindOptionsWhere, FindManyOptions } from "typeorm";
import { Draft } from "../entities/draft.entity";
export declare class DraftRepository {
    private readonly repository;
    constructor(repository: Repository<Draft>);
    find(options: FindManyOptions<Draft>): Promise<Draft[]>;
    findOne(options: {
        where: FindOptionsWhere<Draft>;
        relations?: string[];
    }): Promise<Draft | null>;
    create(data: Partial<Draft>): Draft;
    save(draft: Draft): Promise<Draft>;
    remove(draft: Draft): Promise<Draft>;
}
