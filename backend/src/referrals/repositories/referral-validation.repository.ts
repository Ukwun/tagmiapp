import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, FindManyOptions, FindOptionsWhere } from "typeorm"
import { ReferralValidation } from "../entities/referral-validation.entity"

@Injectable()
export class ReferralValidationRepository {
  constructor(
    @InjectRepository(ReferralValidation)
    private readonly repository: Repository<ReferralValidation>,
  ) {}

  async find(options: FindManyOptions<ReferralValidation>): Promise<ReferralValidation[]> {
    return this.repository.find(options)
  }

  async findOne(options: {
    where: FindOptionsWhere<ReferralValidation>
    relations?: string[]
  }): Promise<ReferralValidation | null> {
    return this.repository.findOne(options)
  }

  create(data: Partial<ReferralValidation>): ReferralValidation {
    return this.repository.create(data)
  }

  async save(validation: ReferralValidation): Promise<ReferralValidation> {
    return this.repository.save(validation)
  }

  async remove(validation: ReferralValidation): Promise<ReferralValidation> {
    return this.repository.remove(validation)
  }
}
