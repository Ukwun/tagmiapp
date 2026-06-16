import { Livestream } from './livestream.entity';
import { User } from '../users/entities/user.entity';
export declare class LivestreamFile {
    id: string;
    livestreamId: string;
    uploadedBy: string;
    fileUrl: string;
    fileName: string;
    fileType: string;
    createdAt: Date;
    livestream: Livestream;
    user: User;
}
