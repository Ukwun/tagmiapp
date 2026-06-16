import { Repository, FindManyOptions, SelectQueryBuilder } from "typeorm";
import { ContentInteraction } from "../entities/content-interaction.entity";
export declare class ContentInteractionRepository {
    private readonly repository;
    constructor(repository: Repository<ContentInteraction>);
    find(options: FindManyOptions<ContentInteraction>): Promise<ContentInteraction[]>;
    findOne(options: any): Promise<ContentInteraction | null>;
    findAndCount(options: FindManyOptions<ContentInteraction>): Promise<[ContentInteraction[], number]>;
    create(data: Partial<ContentInteraction>): ContentInteraction;
    save(interaction: ContentInteraction): Promise<ContentInteraction>;
    remove(interaction: ContentInteraction): Promise<ContentInteraction>;
    createQueryBuilder(alias?: string): SelectQueryBuilder<ContentInteraction>;
    count(options?: FindManyOptions<ContentInteraction>): Promise<number>;
}
