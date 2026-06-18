import { LivestreamService } from './livestream.service';
import { Livestream } from './livestream.entity';
declare class StreamStartDto {
    title: string;
    description?: string;
    userId?: string;
    username?: string;
}
declare class JoinStreamDto {
    userId?: string;
    username?: string;
}
declare class JoinTokenDto {
    userId?: string;
    username?: string;
}
export declare class LivestreamController {
    private readonly livestreamService;
    constructor(livestreamService: LivestreamService);
    getActiveStreams(): Promise<Array<Livestream & {
        viewers: number;
    }>>;
    startStream(body: StreamStartDto): Promise<{
        stream: Livestream;
        roomId: string;
    }>;
    joinStream(streamId: string, body: JoinStreamDto): Promise<{
        streamId: string;
        roomId: string;
    }>;
    getJoinToken(streamId: string, body: JoinTokenDto): Promise<{
        token: string;
        roomId: string;
    }>;
}
export {};
