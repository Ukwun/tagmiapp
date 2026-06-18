import { Repository, FindManyOptions, FindOptionsWhere, SelectQueryBuilder } from "typeorm";
import { BookingMessage } from "../entities/booking-message.entity";
export declare class BookingMessageRepository {
    private readonly repository;
    constructor(repository: Repository<BookingMessage>);
    find(options: FindManyOptions<BookingMessage>): Promise<BookingMessage[]>;
    findOne(options: {
        where: FindOptionsWhere<BookingMessage>;
        relations?: string[];
    }): Promise<BookingMessage | null>;
    findAndCount(options: FindManyOptions<BookingMessage>): Promise<[BookingMessage[], number]>;
    create(data: Partial<BookingMessage>): BookingMessage;
    save(message: BookingMessage): Promise<BookingMessage>;
    remove(message: BookingMessage): Promise<BookingMessage>;
    createQueryBuilder(alias?: string): SelectQueryBuilder<BookingMessage>;
}
