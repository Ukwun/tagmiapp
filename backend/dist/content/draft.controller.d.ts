import { DraftService } from "./draft.service";
export declare class DraftController {
    private draftService;
    constructor(draftService: DraftService);
    createDraft(req: any, dto: any): Promise<import("./entities/draft.entity").Draft>;
    updateDraft(id: string, req: any, dto: any): Promise<import("./entities/draft.entity").Draft>;
    listDrafts(req: any): Promise<import("./entities/draft.entity").Draft[]>;
    getDraft(id: string, req: any): Promise<import("./entities/draft.entity").Draft>;
    deleteDraft(id: string, req: any): Promise<{
        message: string;
    }>;
}
