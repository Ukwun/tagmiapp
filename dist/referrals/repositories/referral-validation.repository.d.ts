import { Repository, FindManyOptions, FindOptionsWhere } from "typeorm";
import { ReferralValidation } from "../entities/referral-validation.entity";
export declare class ReferralValidationRepository {
    private readonly repository;
    constructor(repository: Repository<ReferralValidation>);
    find(options: FindManyOptions<ReferralValidation>): Promise<ReferralValidation[]>;
    findOne(options: {
        where: FindOptionsWhere<ReferralValidation>;
        relations?: string[];
    }): Promise<ReferralValidation | null>;
    create(data: Partial<ReferralValidation>): ReferralValidation;
    save(validation: ReferralValidation): Promise<ReferralValidation>;
    remove(validation: ReferralValidation): Promise<ReferralValidation>;
}
