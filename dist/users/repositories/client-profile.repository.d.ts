import { Repository } from "typeorm";
import { ClientProfile } from "../entities/client-profile.entity";
export declare class ClientProfileRepository {
    private repository;
    constructor(repository: Repository<ClientProfile>);
    findByUserIdOptional(userId: string): Promise<ClientProfile | null>;
    save(profile: ClientProfile): Promise<ClientProfile>;
    create(profileData: Partial<ClientProfile>): Promise<ClientProfile>;
}
