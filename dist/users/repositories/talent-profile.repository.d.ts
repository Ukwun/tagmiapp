import { Repository } from "typeorm";
import { TalentProfile } from "../entities/talent-profile.entity";
export declare class TalentProfileRepository {
    private repository;
    constructor(repository: Repository<TalentProfile>);
    findByUserId(userId: string): Promise<TalentProfile>;
    findByUserIdOptional(userId: string): Promise<TalentProfile | null>;
    save(profile: TalentProfile): Promise<TalentProfile>;
    create(profileData: Partial<TalentProfile>): Promise<TalentProfile>;
    searchTalents(query?: string, skills?: string[], categories?: string[], page?: number, limit?: number, excludeUserId?: string): Promise<[TalentProfile[], number]>;
}
