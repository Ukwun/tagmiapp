import { User } from "../../users/entities/user.entity";
export declare enum NotificationType {
    LIKE = "like",
    COMMENT = "comment",
    FOLLOW = "follow",
    MESSAGE = "message",
    MENTION = "mention",
    COMMENT_REPLY = "comment_reply"
}
export declare class Notification {
    id: string;
    userId: string;
    user: User;
    actorId: string;
    actor: User;
    type: NotificationType;
    contentId?: string;
    commentId?: string;
    chatRoomId?: string;
    message?: string;
    read: boolean;
    createdAt: Date;
    updatedAt: Date;
}
