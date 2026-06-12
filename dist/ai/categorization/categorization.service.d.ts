import { OnModuleInit } from "@nestjs/common";
import { Repository } from "typeorm";
import { EmbeddingsService } from "../embeddings/embeddings.service";
import { Content } from "../../content/entities/content.entity";
export declare class CategorizationService implements OnModuleInit {
    private readonly embeddingsService;
    private readonly contentRepository;
    private readonly logger;
    private categoryEmbeddings;
    constructor(embeddingsService: EmbeddingsService, contentRepository: Repository<Content>);
    onModuleInit(): Promise<void>;
    private precomputeCategoryEmbeddings;
    categorize(text: string, topK?: number): Promise<{
        category: string;
        confidence: number;
    }[]>;
    categorizeByContentId(contentId: string): Promise<{
        category: string;
        confidence: number;
    }[]>;
    getCategories(): string[];
}
