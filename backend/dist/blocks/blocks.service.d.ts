import { BlockRepository } from "./repositories/block.repository";
import { UserRepository } from "../users/repositories/user.repository";
export declare class BlocksService {
    private blockRepository;
    private userRepository;
    constructor(blockRepository: BlockRepository, userRepository: UserRepository);
    blockUser(blockerId: string, blockedId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    unblockUser(blockerId: string, blockedId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getBlockedUsers(userId: string, page?: number, limit?: number): Promise<{
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
    isBlocked(blockerId: string, blockedId: string): Promise<boolean>;
    isBlockedByEither(userId1: string, userId2: string): Promise<boolean>;
    getBlockedUserIds(userId: string): Promise<string[]>;
    getUsersWhoBlockedMe(userId: string): Promise<string[]>;
}
