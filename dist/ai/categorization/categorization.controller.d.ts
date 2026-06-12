import { CategorizationService } from "./categorization.service";
export declare class CategorizationController {
    private readonly categorizationService;
    constructor(categorizationService: CategorizationService);
    categorize(body: {
        text: string;
        topK?: number;
    }): Promise<{
        category: string;
        confidence: number;
    }[]>;
    categorizeContent(id: string): Promise<{
        category: string;
        confidence: number;
    }[]>;
    getCategories(): string[];
}
