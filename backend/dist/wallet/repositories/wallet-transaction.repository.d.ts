import { Repository, FindManyOptions, FindOptionsWhere } from "typeorm";
import { WalletTransaction } from "../entities/wallet-transaction.entity";
export declare class WalletTransactionRepository {
    private readonly repository;
    constructor(repository: Repository<WalletTransaction>);
    find(options: FindManyOptions<WalletTransaction>): Promise<WalletTransaction[]>;
    findOne(options: {
        where: FindOptionsWhere<WalletTransaction>;
        relations?: string[];
    }): Promise<WalletTransaction | null>;
    findAndCount(options: FindManyOptions<WalletTransaction>): Promise<[WalletTransaction[], number]>;
    create(data: Partial<WalletTransaction>): WalletTransaction;
    save(transaction: WalletTransaction): Promise<WalletTransaction>;
    remove(transaction: WalletTransaction): Promise<WalletTransaction>;
}
