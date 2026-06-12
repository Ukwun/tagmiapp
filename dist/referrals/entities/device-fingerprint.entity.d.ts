import { User } from "../../users/entities/user.entity";
export declare class DeviceFingerprint {
    id: string;
    userId: string;
    fingerprintHash: string;
    ip: string;
    ipSubnet: string;
    components: Record<string, any>;
    userAgent: string;
    timezone: string;
    screenResolution: string;
    language: string;
    isVpn: boolean;
    isProxy: boolean;
    isDatacenter: boolean;
    createdAt: Date;
    user: User;
}
