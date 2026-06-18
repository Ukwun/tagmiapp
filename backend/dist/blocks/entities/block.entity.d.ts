import { User } from "../../users/entities/user.entity";
export declare class Block {
    id: string;
    blockerId: string;
    blocker: User;
    blockedId: string;
    blocked: User;
    createdAt: Date;
}
