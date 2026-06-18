import { Repository } from "typeorm";
import { User } from "../../users/entities/user.entity";
export declare class UserRepositoryHelper {
    private userRepository;
    constructor(userRepository: Repository<User>);
    findByIdOrFail(id: string, relations?: string[]): Promise<User>;
    findById(id: string, relations?: string[]): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByIds(ids: string[], relations?: string[]): Promise<User[]>;
    exists(id: string): Promise<boolean>;
}
