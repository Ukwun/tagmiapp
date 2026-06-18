import { BlocksService } from "./blocks.service";
export declare class BlocksController {
    private readonly blocksService;
    constructor(blocksService: BlocksService);
    blockUser(userId: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    unblockUser(userId: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getBlockedUsers(req: any, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            username: string;
            displayName: string;
            avatarUrl: string;
            blockedAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
    isBlocked(userId: string, req: any): Promise<{
        blocked: boolean;
    }>;
}
