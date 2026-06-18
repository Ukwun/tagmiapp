import { Referral } from "../entities/referral.entity";
import { FraudFlag, FraudFlagStatus } from "../entities/fraud-flag.entity";
import { DeviceFingerprint } from "../entities/device-fingerprint.entity";
import { WalletService } from "../../wallet/wallet.service";
import { ReferralRepository } from "../repositories/referral.repository";
import { DeviceFingerprintRepository } from "../repositories/device-fingerprint.repository";
import { FraudFlagRepository } from "../repositories/fraud-flag.repository";
import { UserRepository } from "../../users/repositories/user.repository";
export declare class FraudDetectionService {
    private referralRepository;
    private deviceFingerprintRepository;
    private fraudFlagRepository;
    private userRepository;
    private walletService;
    private readonly logger;
    constructor(referralRepository: ReferralRepository, deviceFingerprintRepository: DeviceFingerprintRepository, fraudFlagRepository: FraudFlagRepository, userRepository: UserRepository, walletService: WalletService);
    extractIpSubnet(ip: string): string;
    analyzeRegistration(referral: Referral, fingerprintHash: string, ip: string): Promise<{
        blocked: boolean;
        riskScore: number;
        flags: FraudFlag[];
    }>;
    checkDuplicateDevice(fingerprintHash: string, referrerId: string, referralId: string): Promise<FraudFlag | null>;
    checkIpSubnetCluster(ip: string, referrerId: string, referralId: string): Promise<FraudFlag | null>;
    checkVpnProxy(ip: string, referralId: string): Promise<FraudFlag | null>;
    checkVelocity(referrerId: string, referralId: string): Promise<FraudFlag | null>;
    checkCircularReferral(referrerId: string, referredUserId: string, referralId: string): Promise<FraudFlag | null>;
    saveDeviceFingerprint(userId: string, fingerprintHash: string, ip: string, components?: Record<string, any>, userAgent?: string): Promise<DeviceFingerprint>;
    getFraudFlags(page?: number, limit?: number, status?: FraudFlagStatus): Promise<{
        data: FraudFlag[];
        total: number;
        page: number;
        limit: number;
        hasNext: boolean;
        hasPrev: boolean;
    }>;
    resolveFraudFlag(flagId: string, status: FraudFlagStatus, resolution: string): Promise<FraudFlag>;
}
