import { Repository, FindManyOptions, FindOptionsWhere, SelectQueryBuilder } from "typeorm";
import { Booking } from "../entities/booking.entity";
export declare class BookingRepository {
    private readonly repository;
    constructor(repository: Repository<Booking>);
    find(options: FindManyOptions<Booking>): Promise<Booking[]>;
    findOne(options: {
        where: FindOptionsWhere<Booking>;
        relations?: string[];
    }): Promise<Booking | null>;
    findAndCount(options: FindManyOptions<Booking>): Promise<[Booking[], number]>;
    create(data: Partial<Booking>): Booking;
    save(booking: Booking): Promise<Booking>;
    remove(booking: Booking): Promise<Booking>;
    createQueryBuilder(alias: string): SelectQueryBuilder<Booking>;
    get manager(): import("typeorm").EntityManager;
    count(options?: FindManyOptions<Booking>): Promise<number>;
}
