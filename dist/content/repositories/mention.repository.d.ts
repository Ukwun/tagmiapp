import { Repository } from "typeorm";
import { Mention } from "../entities/mention.entity";
export declare class MentionRepository {
    private readonly repository;
    constructor(repository: Repository<Mention>);
    save(mentions: any[]): Promise<any[]>;
}
