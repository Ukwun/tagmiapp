import { User } from "../../users/entities/user.entity";
export declare class UserTransformer {
    static sanitize(user: User | null | undefined): Partial<User> | null;
    static sanitizeMany(users: User[]): Partial<User>[];
    static toPublicProfile(user: User): PublicUserProfile;
}
export interface PublicUserProfile {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
}
