import { Content } from "../../content/entities/content.entity";
import { Repository } from "typeorm";
export interface EnrichedContent extends Content {
    isLiked?: boolean;
    isBookmarked?: boolean;
}
export declare class ContentTransformer {
    static enrichWithInteractions(content: Content, userId: string | null, likeRepository: Repository<any>, bookmarkRepository: Repository<any>): Promise<EnrichedContent>;
    static enrichManyWithInteractions(contents: Content[], userId: string | null, likeRepository: Repository<any>, bookmarkRepository: Repository<any>): Promise<EnrichedContent[]>;
}
