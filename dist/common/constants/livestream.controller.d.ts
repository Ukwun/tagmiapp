import { LivestreamService } from './livestream.service';
import { Request } from 'express';
export declare class LivestreamController {
    private readonly livestreamService;
    constructor(livestreamService: LivestreamService);
    startStream(req: Request, title: string, description?: string): Promise<{
        message: string;
        streamId: any;
        roomName: any;
    }>;
    endStream(req: Request, streamId: string): Promise<{
        message: string;
    }>;
    getJoinToken(req: Request, streamId: string): Promise<{
        token: string;
        serverUrl: string;
    }>;
    getActiveStreams(page?: number, limit?: number, category?: string): Promise<{
        streams: Livestream[];
        total: number;
        page: number;
        lastPage: number;
    }>;
}
