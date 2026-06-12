import { User } from "./user.entity";
export declare class Follow {
    id: string;
    followerId: string;
    followingId: string;
    createdAt: Date;
    follower: User;
    following: User;
}
