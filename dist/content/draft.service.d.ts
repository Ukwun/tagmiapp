import { Draft } from "./entities/draft.entity";
import { DraftRepository } from "./repositories/draft.repository";
export declare class DraftService {
    private draftRepository;
    private readonly logger;
    constructor(draftRepository: DraftRepository);
    createDraft(userId: string, dto: any): Promise<Draft>;
    updateDraft(draftId: string, userId: string, dto: any): Promise<Draft>;
    listDrafts(userId: string): Promise<Draft[]>;
    getDraft(draftId: string, userId: string): Promise<Draft>;
    deleteDraft(draftId: string, userId: string): Promise<void>;
    private buildSlides;
}
