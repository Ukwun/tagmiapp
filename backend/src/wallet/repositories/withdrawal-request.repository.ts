import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, FindManyOptions, FindOptionsWhere } from "typeorm"
import { WithdrawalRequest } from "../entities/withdrawal-request.entity"

@Injectable()
export class WithdrawalRequestRepository {
  constructor(
    @InjectRepository(WithdrawalRequest)
    private readonly repository: Repository<WithdrawalRequest>,
  ) {}

  async find(options: FindManyOptions<WithdrawalRequest>): Promise<WithdrawalRequest[]> {
    return this.repository.find(options)
  }

  async findOne(options: {
    where: FindOptionsWhere<WithdrawalRequest>
    relations?: string[]
  }): Promise<WithdrawalRequest | null> {
    return this.repository.findOne(options)
  }

  async findAndCount(options: FindManyOptions<WithdrawalRequest>): Promise<[WithdrawalRequest[], number]> {
    return this.repository.findAndCount(options)
  }

  create(data: Partial<WithdrawalRequest>): WithdrawalRequest {
    return this.repository.create(data)
  }

  async save(request: WithdrawalRequest): Promise<WithdrawalRequest> {
    return this.repository.save(request)
  }

  async remove(request: WithdrawalRequest): Promise<WithdrawalRequest> {
    return this.repository.remove(request)
  }
}
