import { Repository, FindManyOptions, FindOptionsWhere, SelectQueryBuilder } from "typeorm";
import { ChatRoom } from "../entities/chat-room.entity";
export declare class ChatRoomRepository {
    private readonly repository;
    constructor(repository: Repository<ChatRoom>);
    find(options: FindManyOptions<ChatRoom>): Promise<ChatRoom[]>;
    findOne(options: {
        where: FindOptionsWhere<ChatRoom>;
        relations?: string[];
    }): Promise<ChatRoom | null>;
    findAndCount(options: FindManyOptions<ChatRoom>): Promise<[ChatRoom[], number]>;
    create(data: Partial<ChatRoom>): ChatRoom;
    save(room: ChatRoom): Promise<ChatRoom>;
    remove(room: ChatRoom): Promise<ChatRoom>;
    createQueryBuilder(alias: string): SelectQueryBuilder<ChatRoom>;
}
