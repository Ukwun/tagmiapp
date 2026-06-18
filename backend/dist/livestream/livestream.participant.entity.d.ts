import { Livestream } from "./livestream.entity";
import { User } from "../users/entities/user.entity";
export declare enum LivestreamRole {
    HOST = "HOST",
    PRESENTER = "PRESENTER",
    PARTICIPANT = "PARTICIPANT"
}
export declare class LivestreamParticipant {
    id: string;
    livestreamId: string;
    userId: string;
    role: LivestreamRole;
    joinedAt: Date;
    leftAt: Date;
    lastActiveAt: Date;
    livestream: Livestream;
    user: User;
}
