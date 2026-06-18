import { Repository, SelectQueryBuilder, FindManyOptions } from "typeorm";
import { EngagementSignal } from "../entities/engagement-signal.entity";
export declare class EngagementSignalRepository {
    private readonly repository;
    constructor(repository: Repository<EngagementSignal>);
    create(data: Partial<EngagementSignal>): EngagementSignal;
    save(signals: EngagementSignal[]): Promise<EngagementSignal[]>;
    createQueryBuilder(alias?: string): SelectQueryBuilder<EngagementSignal>;
    count(options?: FindManyOptions<EngagementSignal>): Promise<number>;
}
