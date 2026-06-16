import { Repository, FindManyOptions, FindOptionsWhere } from "typeorm";
import { FraudFlag } from "../entities/fraud-flag.entity";
export declare class FraudFlagRepository {
    private readonly repository;
    constructor(repository: Repository<FraudFlag>);
    find(options: FindManyOptions<FraudFlag>): Promise<FraudFlag[]>;
    findOne(options: {
        where: FindOptionsWhere<FraudFlag>;
        relations?: string[];
    }): Promise<FraudFlag | null>;
    findAndCount(options: FindManyOptions<FraudFlag>): Promise<[FraudFlag[], number]>;
    create(data: Partial<FraudFlag>): FraudFlag;
    save(flag: FraudFlag): Promise<FraudFlag>;
    remove(flag: FraudFlag): Promise<FraudFlag>;
}
