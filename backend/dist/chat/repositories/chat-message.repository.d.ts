import { Repository, FindManyOptions, FindOptionsWhere, SelectQueryBuilder } from "typeorm";
import { ChatMessage } from "../entities/chat-message.entity";
export declare class ChatMessageRepository {
    private readonly repository;
    constructor(repository: Repository<ChatMessage>);
    find(options: FindManyOptions<ChatMessage>): Promise<ChatMessage[]>;
    findOne(options: {
        where: FindOptionsWhere<ChatMessage>;
        relations?: string[];
    }): Promise<ChatMessage | null>;
    findAndCount(options: FindManyOptions<ChatMessage>): Promise<[ChatMessage[], number]>;
    count(options: FindManyOptions<ChatMessage>): Promise<number>;
    create(data: Partial<ChatMessage>): ChatMessage;
    save(message: ChatMessage): Promise<ChatMessage>;
    remove(message: ChatMessage): Promise<ChatMessage>;
    createQueryBuilder(alias?: string): SelectQueryBuilder<ChatMessage>;
}
