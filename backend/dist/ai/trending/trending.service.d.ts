import { Repository } from "typeorm";
import { Content } from "../../content/entities/content.entity";
import { HashtagStat } from "./hashtag-stat.entity";
export declare class TrendingService {
    private readonly contentRepository;
    private readonly hashtagStatRepository;
    private readonly logger;
    constructor(contentRepository: Repository<Content>, hashtagStatRepository: Repository<HashtagStat>);
    recalculateTrendingHashtags(): Promise<void>;
    getTrendingHashtags(limit?: number): Promise<HashtagStat[]>;
    getHashtagStats(hashtag: string): Promise<HashtagStat>;
}
