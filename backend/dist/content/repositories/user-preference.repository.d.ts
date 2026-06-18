import { Repository, SelectQueryBuilder } from "typeorm";
import { UserCategoryPreference } from "../entities/user-category-preference.entity";
export declare class UserPreferenceRepository {
    private readonly repository;
    constructor(repository: Repository<UserCategoryPreference>);
    findByUserId(userId: string): Promise<UserCategoryPreference[]>;
    findOne(userId: string, category: string): Promise<UserCategoryPreference | null>;
    create(data: Partial<UserCategoryPreference>): Promise<UserCategoryPreference>;
    update(id: number, data: Partial<UserCategoryPreference>): Promise<void>;
    upsert(userId: string, category: string, data: Partial<UserCategoryPreference>): Promise<void>;
    getTopPreferences(userId: string, limit?: number): Promise<UserCategoryPreference[]>;
    seedFromInterests(userId: string, interests: string[]): Promise<void>;
    deleteByUserId(userId: string): Promise<void>;
    createQueryBuilder(alias?: string): SelectQueryBuilder<UserCategoryPreference>;
}
