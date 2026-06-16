import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, FindManyOptions, FindOptionsWhere } from "typeorm"
import { WalletTransaction } from "../entities/wallet-transaction.entity"

@Injectable()
export class WalletTransactionRepository {
  constructor(
    @InjectRepository(WalletTransaction)
    private readonly repository: Repository<WalletTransaction>,
  ) {}

  async find(options: FindManyOptions<WalletTransaction>): Promise<WalletTransaction[]> {
    return this.repository.find(options)
  }

  async findOne(options: {
    where: FindOptionsWhere<WalletTransaction>
    relations?: string[]
  }): Promise<WalletTransaction | null> {
    return this.repository.findOne(options)
  }

  async findAndCount(options: FindManyOptions<WalletTransaction>): Promise<[WalletTransaction[], number]> {
    return this.repository.findAndCount(options)
  }

  create(data: Partial<WalletTransaction>): WalletTransaction {
    return this.repository.create(data)
  }

  async save(transaction: WalletTransaction): Promise<WalletTransaction> {
    return this.repository.save(transaction)
  }

  async remove(transaction: WalletTransaction): Promise<WalletTransaction> {
    return this.repository.remove(transaction)
  }
}
