import { Repository } from "typeorm";
import { EmbeddingsService } from "../embeddings/embeddings.service";
import { Content } from "../../content/entities/content.entity";
import { ContentEmbedding } from "../embeddings/content-embedding.entity";
export declare class GenerationService {
    private readonly embeddingsService;
    private readonly contentRepository;
    private readonly contentEmbeddingRepository;
    constructor(embeddingsService: EmbeddingsService, contentRepository: Repository<Content>, contentEmbeddingRepository: Repository<ContentEmbedding>);
    suggestHashtags(caption: string, limit?: number): Promise<string[]>;
    private fallbackHashtagSuggestion;
}
