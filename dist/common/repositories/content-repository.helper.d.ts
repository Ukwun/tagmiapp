import { Repository } from "typeorm";
import { Content } from "../../content/entities/content.entity";
export interface ContentFindOptions {
    userId?: string;
    includeAuthor?: boolean;
    includeSlides?: boolean;
    includeInteractions?: boolean;
    includeComments?: boolean;
}
export declare class ContentRepositoryHelper {
    private contentRepository;
    constructor(contentRepository: Repository<Content>);
    findByIdOrFail(id: string, options?: ContentFindOptions): Promise<Content>;
    findById(id: string, options?: ContentFindOptions): Promise<Content | null>;
    findByUser(userId: string, options?: ContentFindOptions): Promise<Content[]>;
    findRecent(options?: ContentFindOptions): Promise<Content[]>;
    private buildRelations;
}
