import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, FindManyOptions, FindOptionsWhere } from "typeorm"
import { Wallet } from "../entities/wallet.entity"

@Injectable()
export class WalletRepository {
  constructor(
    @InjectRepository(Wallet)
    private readonly repository: Repository<Wallet>,
  ) {}

  async find(options: FindManyOptions<Wallet>): Promise<Wallet[]> {
    return this.repository.find(options)
  }

  async findOne(options: {
    where: FindOptionsWhere<Wallet>
    relations?: string[]
  }): Promise<Wallet | null> {
    return this.repository.findOne(options)
  }

  async findAndCount(options: FindManyOptions<Wallet>): Promise<[Wallet[], number]> {
    return this.repository.findAndCount(options)
  }

  create(data: Partial<Wallet>): Wallet {
    return this.repository.create(data)
  }

  async save(wallet: Wallet): Promise<Wallet> {
    return this.repository.save(wallet)
  }

  async remove(wallet: Wallet): Promise<Wallet> {
    return this.repository.remove(wallet)
  }
}
