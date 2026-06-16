import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, FindManyOptions, FindOptionsWhere, SelectQueryBuilder } from "typeorm"
import { ChatRoom } from "../entities/chat-room.entity"

@Injectable()
export class ChatRoomRepository {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly repository: Repository<ChatRoom>,
  ) {}

  async find(options: FindManyOptions<ChatRoom>): Promise<ChatRoom[]> {
    return this.repository.find(options)
  }

  async findOne(options: {
    where: FindOptionsWhere<ChatRoom>
    relations?: string[]
  }): Promise<ChatRoom | null> {
    return this.repository.findOne(options)
  }

  async findAndCount(options: FindManyOptions<ChatRoom>): Promise<[ChatRoom[], number]> {
    return this.repository.findAndCount(options)
  }

  create(data: Partial<ChatRoom>): ChatRoom {
    return this.repository.create(data)
  }

  async save(room: ChatRoom): Promise<ChatRoom> {
    return this.repository.save(room)
  }

  async remove(room: ChatRoom): Promise<ChatRoom> {
    return this.repository.remove(room)
  }

  createQueryBuilder(alias: string): SelectQueryBuilder<ChatRoom> {
    return this.repository.createQueryBuilder(alias)
  }
}
