import { User } from "../../users/entities/user.entity";
export declare class UserSession {
    id: string;
    userId: string;
    ip: string;
    deviceFingerprintHash: string;
    startedAt: Date;
    endedAt: Date;
    durationSeconds: number;
    createdAt: Date;
    user: User;
}
