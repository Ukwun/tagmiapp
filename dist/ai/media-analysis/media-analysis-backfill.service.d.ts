import { Repository } from "typeorm";
import { Content } from "../../content/entities/content.entity";
import { MediaAnalysisService } from "./media-analysis.service";
import { EmbeddingsService } from "../embeddings/embeddings.service";
export declare class MediaAnalysisBackfillService {
    private readonly contentRepository;
    private readonly mediaAnalysisService;
    private readonly embeddingsService;
    private readonly logger;
    private isRunning;
    constructor(contentRepository: Repository<Content>, mediaAnalysisService: MediaAnalysisService, embeddingsService: EmbeddingsService);
    runBackfill(): Promise<void>;
}
