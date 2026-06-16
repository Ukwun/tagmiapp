import { Repository, FindOptionsWhere, FindManyOptions } from "typeorm";
import { Notification } from "../entities/notification.entity";
export declare class NotificationRepository {
    private readonly repository;
    constructor(repository: Repository<Notification>);
    find(options: FindManyOptions<Notification>): Promise<Notification[]>;
    findOne(options: {
        where: FindOptionsWhere<Notification>;
        relations?: string[];
    }): Promise<Notification | null>;
    create(data: Partial<Notification>): Notification;
    save(notification: Notification): Promise<Notification>;
    count(options: FindManyOptions<Notification>): Promise<number>;
    update(criteria: any, updates: Partial<Notification>): Promise<void>;
    delete(criteria: FindOptionsWhere<Notification>): Promise<void>;
}
