import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, FindManyOptions, FindOptionsWhere, SelectQueryBuilder } from "typeorm"
import { BookingMessage } from "../entities/booking-message.entity"

@Injectable()
export class BookingMessageRepository {
  constructor(
    @InjectRepository(BookingMessage)
    private readonly repository: Repository<BookingMessage>,
  ) {}

  async find(options: FindManyOptions<BookingMessage>): Promise<BookingMessage[]> {
    return this.repository.find(options)
  }

  async findOne(options: {
    where: FindOptionsWhere<BookingMessage>
    relations?: string[]
  }): Promise<BookingMessage | null> {
    return this.repository.findOne(options)
  }

  async findAndCount(options: FindManyOptions<BookingMessage>): Promise<[BookingMessage[], number]> {
    return this.repository.findAndCount(options)
  }

  create(data: Partial<BookingMessage>): BookingMessage {
    return this.repository.create(data)
  }

  async save(message: BookingMessage): Promise<BookingMessage> {
    return this.repository.save(message)
  }

  async remove(message: BookingMessage): Promise<BookingMessage> {
    return this.repository.remove(message)
  }

  createQueryBuilder(alias?: string): SelectQueryBuilder<BookingMessage> {
    return this.repository.createQueryBuilder(alias)
  }
}
