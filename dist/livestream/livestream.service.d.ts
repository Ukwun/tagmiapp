import { Repository } from 'typeorm';
import { Livestream } from './livestream.entity';
import { LivestreamParticipant } from './livestream.participant.entity';
import { LivestreamFile } from './livestream.file.entity';
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
}
