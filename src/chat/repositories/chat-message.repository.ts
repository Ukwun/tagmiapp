import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, FindManyOptions, FindOptionsWhere, SelectQueryBuilder } from "typeorm"
import { ChatMessage } from "../entities/chat-message.entity"

@Injectable()
export class ChatMessageRepository {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly repository: Repository<ChatMessage>,
  ) {}

  async find(options: FindManyOptions<ChatMessage>): Promise<ChatMessage[]> {
    return this.repository.find(options)
  }

  async findOne(options: {
    where: FindOptionsWhere<ChatMessage>
    relations?: string[]
  }): Promise<ChatMessage | null> {
    return this.repository.findOne(options)
  }

  async findAndCount(options: FindManyOptions<ChatMessage>): Promise<[ChatMessage[], number]> {
    return this.repository.findAndCount(options)
  }

  async count(options: FindManyOptions<ChatMessage>): Promise<number> {
    return this.repository.count(options)
  }

  create(data: Partial<ChatMessage>): ChatMessage {
    return this.repository.create(data)
  }

  async save(message: ChatMessage): Promise<ChatMessage> {
    return this.repository.save(message)
  }

  async remove(message: ChatMessage): Promise<ChatMessage> {
    return this.repository.remove(message)
  }

  createQueryBuilder(alias?: string): SelectQueryBuilder<ChatMessage> {
    return this.repository.createQueryBuilder(alias)
  }
}
