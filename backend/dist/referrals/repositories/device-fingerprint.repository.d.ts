import { Repository, FindManyOptions, FindOptionsWhere } from "typeorm";
import { DeviceFingerprint } from "../entities/device-fingerprint.entity";
export declare class DeviceFingerprintRepository {
    private readonly repository;
    constructor(repository: Repository<DeviceFingerprint>);
    find(options: FindManyOptions<DeviceFingerprint>): Promise<DeviceFingerprint[]>;
    findOne(options: {
        where: FindOptionsWhere<DeviceFingerprint>;
        relations?: string[];
    }): Promise<DeviceFingerprint | null>;
    create(data: Partial<DeviceFingerprint>): DeviceFingerprint;
    save(fingerprint: DeviceFingerprint): Promise<DeviceFingerprint>;
    remove(fingerprint: DeviceFingerprint): Promise<DeviceFingerprint>;
}
