import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, FindManyOptions, FindOptionsWhere, SelectQueryBuilder } from "typeorm"
import { Booking } from "../entities/booking.entity"

@Injectable()
export class BookingRepository {
  constructor(
    @InjectRepository(Booking)
    private readonly repository: Repository<Booking>,
  ) {}

  async find(options: FindManyOptions<Booking>): Promise<Booking[]> {
    return this.repository.find(options)
  }

  async findOne(options: {
    where: FindOptionsWhere<Booking>
    relations?: string[]
  }): Promise<Booking | null> {
    return this.repository.findOne(options)
  }

  async findAndCount(options: FindManyOptions<Booking>): Promise<[Booking[], number]> {
    return this.repository.findAndCount(options)
  }

  create(data: Partial<Booking>): Booking {
    return this.repository.create(data)
  }

  async save(booking: Booking): Promise<Booking> {
    return this.repository.save(booking)
  }

  async remove(booking: Booking): Promise<Booking> {
    return this.repository.remove(booking)
  }

  createQueryBuilder(alias: string): SelectQueryBuilder<Booking> {
    return this.repository.createQueryBuilder(alias)
  }

  get manager() {
    return this.repository.manager
  }

  async count(options?: FindManyOptions<Booking>): Promise<number> {
    return this.repository.count(options)
  }
}
