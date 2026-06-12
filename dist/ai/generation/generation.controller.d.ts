import { GenerationService } from "./generation.service";
export declare class GenerationController {
    private readonly generationService;
    constructor(generationService: GenerationService);
    suggestHashtags(body: {
        caption: string;
        limit?: number;
    }): Promise<string[]>;
}
