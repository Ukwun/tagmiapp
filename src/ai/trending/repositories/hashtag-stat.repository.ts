import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, FindManyOptions } from "typeorm"
import { HashtagStat } from "../hashtag-stat.entity"

@Injectable()
export class HashtagStatRepository {
  constructor(
    @InjectRepository(HashtagStat)
    private readonly repository: Repository<HashtagStat>,
  ) {}

  async find(options: FindManyOptions<HashtagStat>): Promise<HashtagStat[]> {
    return this.repository.find(options)
  }
}
