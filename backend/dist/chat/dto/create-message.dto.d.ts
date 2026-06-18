export declare class CreateMessageDto {
    content: string;
    type?: "text" | "image" | "file" | "system";
    attachments?: string[];
    replyToId?: string;
}
