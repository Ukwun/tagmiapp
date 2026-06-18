import { Repository, FindOptionsWhere, FindManyOptions, SelectQueryBuilder } from "typeorm";
import { Content } from "../entities/content.entity";
export declare class ContentRepository {
    private readonly repository;
    constructor(repository: Repository<Content>);
    find(options: FindManyOptions<Content>): Promise<Content[]>;
    findOne(options: {
        where: FindOptionsWhere<Content>;
        relations?: string[];
    }): Promise<Content | null>;
    create(data: Partial<Content>): Content;
    save(content: Content): Promise<Content>;
    save(content: Content[]): Promise<Content[]>;
    update(criteria: any, updates: Partial<Content>): Promise<void>;
    remove(content: Content): Promise<Content>;
    remove(content: Content[]): Promise<Content[]>;
    createQueryBuilder(alias?: string): SelectQueryBuilder<Content>;
    count(options: FindManyOptions<Content>): Promise<number>;
    query(sql: string, parameters?: any[]): Promise<any>;
}
