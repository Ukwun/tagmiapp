import { Repository, SelectQueryBuilder, FindManyOptions, FindOptionsWhere } from "typeorm";
import { User } from "../entities/user.entity";
export declare class UserRepository {
    private repository;
    constructor(repository: Repository<User>);
    findById(id: string): Promise<User>;
    findByIdOptional(id: string): Promise<User | null>;
    findByUsername(username: string): Promise<User>;
    findByUsernameOptional(username: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByEmailOrUsername(emailOrUsername: string): Promise<User | null>;
    findByEmailOrUsernameWithPassword(emailOrUsername: string): Promise<User | null>;
    update(id: string, updates: Partial<User>): Promise<void>;
    findByUsernames(usernames: string[]): Promise<User[]>;
    save(user: User): Promise<User>;
    create(userData: Partial<User>): Promise<User>;
    searchUsers(query: string, limit: number): Promise<User[]>;
    findSuggestedUsers(excludeIds: string[], limit: number): Promise<User[]>;
    createQueryBuilder(alias: string): SelectQueryBuilder<User>;
    findOne(options: {
        where: FindOptionsWhere<User> | FindOptionsWhere<User>[];
        relations?: string[];
        select?: (keyof User)[];
    }): Promise<User | null>;
    count(options?: FindManyOptions<User>): Promise<number>;
    findByIds(ids: string[]): Promise<User[]>;
}
