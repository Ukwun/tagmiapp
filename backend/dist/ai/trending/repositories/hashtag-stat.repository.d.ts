import { Repository, FindManyOptions } from "typeorm";
import { HashtagStat } from "../hashtag-stat.entity";
export declare class HashtagStatRepository {
    private readonly repository;
    constructor(repository: Repository<HashtagStat>);
    find(options: FindManyOptions<HashtagStat>): Promise<HashtagStat[]>;
}
