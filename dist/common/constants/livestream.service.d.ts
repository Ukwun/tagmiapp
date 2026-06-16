import { Repository } from 'typeorm';
import { Livestream } from '../../livestream/livestream.entity';
import { LivestreamParticipant } from '../../livestream/livestream.participant.entity';
import { LivestreamFile } from '../../livestream/livestream.file.entity';
export declare class LivestreamService {
    private livestreamRepository;
    private participantRepository;
    private fileRepository;
    constructor(livestreamRepository: Repository<Livestream>, participantRepository: Repository<LivestreamParticipant>, fileRepository: Repository<LivestreamFile>);
    private validateStreamSafety;
    startStream(userId: string, title: string, description?: string): Promise<Livestream>;
    joinStream(streamId: string, userId: string): Promise<LivestreamParticipant>;
    updateHeartbeat(streamId: string, userId: string): Promise<void>;
    shareFile(streamId: string, userId: string, fileUrl: string, fileType: string): Promise<LivestreamFile>;
    getJoinToken(streamId: string, userId: string, username: string): Promise<string>;
    toggleScreenShare(streamId: string, userId: string, isSharing: boolean, presentationUrl?: string): Promise<Livestream>;
    updatePdfPage(streamId: string, userId: string, page: number): Promise<Livestream>;
    endStream(streamId: string, userId: string): Promise<void>;
    getActiveStreams(page: number, limit: number, category?: string, userInterests?: string[]): Promise<{
        streams: Livestream[];
        total: number;
        page: number;
        lastPage: number;
    }>;
    isHost(streamId: string, userId: string): Promise<boolean>;
    getParticipants(streamId: string): Promise<LivestreamParticipant[]>;
    cleanupAllInactiveParticipants(): Promise<void>;
}
