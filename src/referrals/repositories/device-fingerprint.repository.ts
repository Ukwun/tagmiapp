import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, FindManyOptions, FindOptionsWhere } from "typeorm"
import { DeviceFingerprint } from "../entities/device-fingerprint.entity"

@Injectable()
export class DeviceFingerprintRepository {
  constructor(
    @InjectRepository(DeviceFingerprint)
    private readonly repository: Repository<DeviceFingerprint>,
  ) {}

  async find(options: FindManyOptions<DeviceFingerprint>): Promise<DeviceFingerprint[]> {
    return this.repository.find(options)
  }

  async findOne(options: {
    where: FindOptionsWhere<DeviceFingerprint>
    relations?: string[]
  }): Promise<DeviceFingerprint | null> {
    return this.repository.findOne(options)
  }

  create(data: Partial<DeviceFingerprint>): DeviceFingerprint {
    return this.repository.create(data)
  }

  async save(fingerprint: DeviceFingerprint): Promise<DeviceFingerprint> {
    return this.repository.save(fingerprint)
  }

  async remove(fingerprint: DeviceFingerprint): Promise<DeviceFingerprint> {
    return this.repository.remove(fingerprint)
  }
}
