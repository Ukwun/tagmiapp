import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, FindManyOptions, FindOptionsWhere } from "typeorm"
import { FraudFlag } from "../entities/fraud-flag.entity"

@Injectable()
export class FraudFlagRepository {
  constructor(
    @InjectRepository(FraudFlag)
    private readonly repository: Repository<FraudFlag>,
  ) {}

  async find(options: FindManyOptions<FraudFlag>): Promise<FraudFlag[]> {
    return this.repository.find(options)
  }

  async findOne(options: {
    where: FindOptionsWhere<FraudFlag>
    relations?: string[]
  }): Promise<FraudFlag | null> {
    return this.repository.findOne(options)
  }

  async findAndCount(options: FindManyOptions<FraudFlag>): Promise<[FraudFlag[], number]> {
    return this.repository.findAndCount(options)
  }

  create(data: Partial<FraudFlag>): FraudFlag {
    return this.repository.create(data)
  }

  async save(flag: FraudFlag): Promise<FraudFlag> {
    return this.repository.save(flag)
  }

  async remove(flag: FraudFlag): Promise<FraudFlag> {
    return this.repository.remove(flag)
  }
}
