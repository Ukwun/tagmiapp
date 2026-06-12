/**
 * NotificationRepository - Abstraction for Notification entity database operations
 */
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, FindOptionsWhere, FindManyOptions } from "typeorm"
import { Notification } from "../entities/notification.entity"

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly repository: Repository<Notification>,
  ) {}

  async find(options: FindManyOptions<Notification>): Promise<Notification[]> {
    return this.repository.find(options)
  }

  async findOne(options: { where: FindOptionsWhere<Notification>; relations?: string[] }): Promise<Notification | null> {
    return this.repository.findOne(options)
  }

  create(data: Partial<Notification>): Notification {
    return this.repository.create(data)
  }

  async save(notification: Notification): Promise<Notification> {
    return this.repository.save(notification)
  }

  async count(options: FindManyOptions<Notification>): Promise<number> {
    return this.repository.count(options)
  }

  async update(criteria: any, updates: Partial<Notification>): Promise<void> {
    await this.repository.update(criteria, updates)
  }

  async delete(criteria: FindOptionsWhere<Notification>): Promise<void> {
    await this.repository.delete(criteria)
  }
}
