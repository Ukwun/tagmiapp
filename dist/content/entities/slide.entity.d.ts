import { Post } from "./post.entity";
export declare class Slide {
    id: string;
    postId: string;
    type: "image" | "video" | "audio" | "text";
    mediaUrl: string;
    thumbnailUrl: string;
    text: string;
    backgroundColor: string;
    duration: number;
    order: number;
    createdAt: Date;
    post: Post;
}
