import { User } from '../users/entities/user.entity';
import { LivestreamParticipant } from './livestream.participant.entity';
import { LivestreamFile } from './livestream.file.entity';
export declare class Livestream {
    id: string;
    title: string;
    description: string;
    hostId: string;
    roomName: string;
    status: 'live' | 'ended';
    category: string;
    isScreenSharing: boolean;
    activePresentationUrl: string;
    currentPdfPage: number;
    startedAt: Date;
    endedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    host: User;
    participants: LivestreamParticipant[];
    files: LivestreamFile[];
}
