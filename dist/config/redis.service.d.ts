import { OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
export declare class RedisService implements OnModuleInit, OnModuleDestroy {
    private configService;
    private client;
    private readonly logger;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    get isConnected(): boolean;
    pushSignals(signals: object[]): Promise<void>;
    drainSignals(batchSize?: number): Promise<string[]>;
    getSignalQueueLength(): Promise<number>;
    getCachedFeed(key: string): Promise<any | null>;
    setCachedFeed(key: string, data: any, ttlSeconds: number): Promise<void>;
    invalidateFeedCache(userId?: string): Promise<void>;
    getCachedScore(postId: string): Promise<{
        completionRate: number;
        avgWatchTime: number;
        avgDwellTime: number;
    } | null>;
    setCachedScores(scores: Array<{
        postId: string;
        completionRate: number;
        avgWatchTime: number;
        avgDwellTime: number;
    }>, ttlSeconds?: number): Promise<void>;
    get(key: string): Promise<string | null>;
    setex(key: string, ttl: number, value: string): Promise<void>;
    del(...keys: string[]): Promise<void>;
}
