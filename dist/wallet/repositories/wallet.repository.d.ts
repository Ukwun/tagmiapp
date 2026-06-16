import { Repository, FindManyOptions, FindOptionsWhere } from "typeorm";
import { Wallet } from "../entities/wallet.entity";
export declare class WalletRepository {
    private readonly repository;
    constructor(repository: Repository<Wallet>);
    find(options: FindManyOptions<Wallet>): Promise<Wallet[]>;
    findOne(options: {
        where: FindOptionsWhere<Wallet>;
        relations?: string[];
    }): Promise<Wallet | null>;
    findAndCount(options: FindManyOptions<Wallet>): Promise<[Wallet[], number]>;
    create(data: Partial<Wallet>): Wallet;
    save(wallet: Wallet): Promise<Wallet>;
    remove(wallet: Wallet): Promise<Wallet>;
}
