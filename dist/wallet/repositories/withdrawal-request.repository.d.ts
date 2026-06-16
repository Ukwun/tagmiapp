import { Repository, FindManyOptions, FindOptionsWhere } from "typeorm";
import { WithdrawalRequest } from "../entities/withdrawal-request.entity";
export declare class WithdrawalRequestRepository {
    private readonly repository;
    constructor(repository: Repository<WithdrawalRequest>);
    find(options: FindManyOptions<WithdrawalRequest>): Promise<WithdrawalRequest[]>;
    findOne(options: {
        where: FindOptionsWhere<WithdrawalRequest>;
        relations?: string[];
    }): Promise<WithdrawalRequest | null>;
    findAndCount(options: FindManyOptions<WithdrawalRequest>): Promise<[WithdrawalRequest[], number]>;
    create(data: Partial<WithdrawalRequest>): WithdrawalRequest;
    save(request: WithdrawalRequest): Promise<WithdrawalRequest>;
    remove(request: WithdrawalRequest): Promise<WithdrawalRequest>;
}
