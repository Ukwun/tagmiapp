import { Repository } from "typeorm";
import { UserSession } from "../entities/user-session.entity";
export declare class SessionTrackingService {
    private sessionRepository;
    constructor(sessionRepository: Repository<UserSession>);
    startSession(userId: string, ip?: string, deviceFingerprintHash?: string): Promise<UserSession>;
    heartbeat(sessionId: string, userId: string): Promise<UserSession>;
    endSession(sessionId: string, userId: string): Promise<void>;
    getSessionStats(userId: string): Promise<{
        uniqueDays: number;
        totalSeconds: number;
        sessionCount: number;
    }>;
}
