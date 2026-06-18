import { Repository, FindManyOptions, FindOneOptions, SelectQueryBuilder } from "typeorm";
import { Referral } from "../entities/referral.entity";
export declare class ReferralRepository {
    private readonly repository;
    constructor(repository: Repository<Referral>);
    find(options: FindManyOptions<Referral>): Promise<Referral[]>;
    findOne(options: FindOneOptions<Referral>): Promise<Referral | null>;
    findAndCount(options: FindManyOptions<Referral>): Promise<[Referral[], number]>;
    count(options?: FindManyOptions<Referral>): Promise<number>;
    create(data: Partial<Referral>): Referral;
    save(referral: Referral): Promise<Referral>;
    remove(referral: Referral): Promise<Referral>;
    update(criteria: any, updates: Partial<Referral>): Promise<void>;
    createQueryBuilder(alias: string): SelectQueryBuilder<Referral>;
    get manager(): import("typeorm").EntityManager;
}
