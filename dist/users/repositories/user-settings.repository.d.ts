import { Repository } from "typeorm";
import { UserSettings } from "../entities/user-settings.entity";
export declare class UserSettingsRepository {
    private repository;
    constructor(repository: Repository<UserSettings>);
    findByUserIdOptional(userId: string): Promise<UserSettings | null>;
    save(settings: UserSettings): Promise<UserSettings>;
    create(userId: string): Promise<UserSettings>;
}
