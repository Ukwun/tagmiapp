import { User } from "../../users/entities/user.entity";
export declare enum ReportType {
    USER = "user",
    POST = "post",
    COMMENT = "comment"
}
export declare enum ReportReason {
    SPAM = "spam",
    HARASSMENT = "harassment",
    HATE_SPEECH = "hate_speech",
    VIOLENCE = "violence",
    NUDITY = "nudity",
    FALSE_INFO = "false_info",
    SCAM = "scam",
    OTHER = "other"
}
export declare enum ReportStatus {
    PENDING = "pending",
    REVIEWED = "reviewed",
    RESOLVED = "resolved",
    DISMISSED = "dismissed"
}
export declare class Report {
    id: string;
    reporterId: string;
    reporter: User;
    type: ReportType;
    reason: ReportReason;
    description: string;
    targetUserId: string;
    targetPostId: string;
    targetCommentId: string;
    status: ReportStatus;
    createdAt: Date;
}
