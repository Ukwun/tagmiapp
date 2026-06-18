import { ContentRepository } from "./repositories/content.repository";
import { UserPreferenceRepository } from "./repositories/user-preference.repository";
import { Content } from "./entities/content.entity";
interface PaginationDto {
    page: number;
    limit: number;
}
export declare class PersonalizedFeedService {
    private readonly contentRepository;
    private readonly userPreferenceRepository;
    private readonly logger;
    constructor(contentRepository: ContentRepository, userPreferenceRepository: UserPreferenceRepository);
    getPersonalizedFeed(userId: string, blockedUserIds: string[], pagination: PaginationDto): Promise<Content[]>;
    private scorePost;
    private interleave;
    private shuffle;
}
export {};
