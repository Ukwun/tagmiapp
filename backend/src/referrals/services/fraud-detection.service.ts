import { Injectable, Logger } from "@nestjs/common"
import { MoreThan } from "typeorm"
import { Referral, ReferralStatus } from "../entities/referral.entity"
import { FraudFlag, FraudFlagType, FraudFlagSeverity, FraudFlagStatus } from "../entities/fraud-flag.entity"
import { DeviceFingerprint } from "../entities/device-fingerprint.entity"
import { WalletService } from "../../wallet/wallet.service"
import { ReferralRepository } from "../repositories/referral.repository"
import { DeviceFingerprintRepository } from "../repositories/device-fingerprint.repository"
import { FraudFlagRepository } from "../repositories/fraud-flag.repository"
import { UserRepository } from "../../users/repositories/user.repository"

// Known datacenter/VPN IP ranges (simplified - extend as needed)
const DATACENTER_SUBNETS = [
  "10.", "172.16.", "172.17.", "172.18.", "172.19.",
  "172.20.", "172.21.", "172.22.", "172.23.", "172.24.",
  "172.25.", "172.26.", "172.27.", "172.28.", "172.29.",
  "172.30.", "172.31.", "192.168.",
]

@Injectable()
export class FraudDetectionService {
  private readonly logger = new Logger(FraudDetectionService.name)

  constructor(
    private referralRepository: ReferralRepository,
    private deviceFingerprintRepository: DeviceFingerprintRepository,
    private fraudFlagRepository: FraudFlagRepository,
    private userRepository: UserRepository,
    private walletService: WalletService,
  ) {}

  extractIpSubnet(ip: string): string {
    if (!ip) return ""
    const parts = ip.split(".")
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`
    }
    return ip
  }

  async analyzeRegistration(
    referral: Referral,
    fingerprintHash: string,
    ip: string,
  ): Promise<{ blocked: boolean; riskScore: number; flags: FraudFlag[] }> {
    const flags: FraudFlag[] = []
    let riskScore = 0

    // 1. Check duplicate device fingerprint
    if (fingerprintHash) {
      const duplicateResult = await this.checkDuplicateDevice(fingerprintHash, referral.referrerId, referral.id)
      if (duplicateResult) {
        flags.push(duplicateResult)
        riskScore += duplicateResult.severity === FraudFlagSeverity.CRITICAL ? 50 : 25
      }
    }

    // 2. Check IP subnet cluster
    if (ip) {
      const ipResult = await this.checkIpSubnetCluster(ip, referral.referrerId, referral.id)
      if (ipResult) {
        flags.push(ipResult)
        riskScore += ipResult.severity === FraudFlagSeverity.HIGH ? 30 : 15
      }
    }

    // 3. Check VPN/proxy
    if (ip) {
      const vpnResult = await this.checkVpnProxy(ip, referral.id)
      if (vpnResult) {
        flags.push(vpnResult)
        riskScore += 20
      }
    }

    // 4. Check velocity
    const velocityResult = await this.checkVelocity(referral.referrerId, referral.id)
    if (velocityResult) {
      flags.push(velocityResult)
      riskScore += 30
    }

    // 5. Check circular referral
    if (referral.referredUserId) {
      const circularResult = await this.checkCircularReferral(
        referral.referrerId,
        referral.referredUserId,
        referral.id,
      )
      if (circularResult) {
        flags.push(circularResult)
        riskScore += 50
      }
    }

    // Save all flags
    for (const flag of flags) {
      await this.fraudFlagRepository.save(flag)
    }

    const blocked = riskScore >= 80

    if (blocked) {
      this.logger.warn(`Referral ${referral.id} auto-blocked with risk score ${riskScore}`)
      await this.walletService.freezeWallet(referral.referrerId, `Auto-frozen: high fraud risk score (${riskScore})`)
    }

    return { blocked, riskScore, flags }
  }

  async checkDuplicateDevice(
    fingerprintHash: string,
    referrerId: string,
    referralId: string,
  ): Promise<FraudFlag | null> {
    // Check if this fingerprint was used by any other user referred by the same referrer
    const existingFingerprints = await this.deviceFingerprintRepository.find({
      where: { fingerprintHash },
    })

    if (existingFingerprints.length === 0) return null

    // Check if any of these devices belong to users referred by the same referrer
    const referrerReferrals = await this.referralRepository.find({
      where: { referrerId },
    })
    const referredUserIds = referrerReferrals.map((r) => r.referredUserId).filter(Boolean)

    const duplicateUsers = existingFingerprints.filter((fp) => referredUserIds.includes(fp.userId))

    if (duplicateUsers.length > 0) {
      return this.fraudFlagRepository.create({
        userId: referrerId,
        referralId,
        type: FraudFlagType.DUPLICATE_DEVICE,
        severity: FraudFlagSeverity.CRITICAL,
        status: FraudFlagStatus.OPEN,
        description: `Same device fingerprint found across ${duplicateUsers.length + 1} referred users`,
        evidence: {
          fingerprintHash,
          matchingUserIds: duplicateUsers.map((fp) => fp.userId),
        },
      })
    }

    // Also check if the fingerprint matches the referrer themselves
    const referrerFingerprint = existingFingerprints.find((fp) => fp.userId === referrerId)
    if (referrerFingerprint) {
      return this.fraudFlagRepository.create({
        userId: referrerId,
        referralId,
        type: FraudFlagType.DUPLICATE_DEVICE,
        severity: FraudFlagSeverity.CRITICAL,
        status: FraudFlagStatus.OPEN,
        description: `Referred user has same device fingerprint as referrer`,
        evidence: { fingerprintHash, referrerId },
      })
    }

    return null
  }

  async checkIpSubnetCluster(ip: string, referrerId: string, referralId: string): Promise<FraudFlag | null> {
    const subnet = this.extractIpSubnet(ip)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    // Count referrals from same subnet in last 24 hours
    const recentReferrals = await this.referralRepository
      .createQueryBuilder("referral")
      .where("referral.referrerId = :referrerId", { referrerId })
      .andWhere("referral.createdAt > :oneDayAgo", { oneDayAgo })
      .getMany()

    const sameSubnetCount = recentReferrals.filter((r) => {
      const rSubnet = this.extractIpSubnet(r.registrationIp || r.clickIp)
      return rSubnet === subnet
    }).length

    if (sameSubnetCount >= 3) {
      return this.fraudFlagRepository.create({
        userId: referrerId,
        referralId,
        type: FraudFlagType.SAME_IP_SUBNET,
        severity: sameSubnetCount >= 5 ? FraudFlagSeverity.HIGH : FraudFlagSeverity.MEDIUM,
        status: FraudFlagStatus.OPEN,
        description: `${sameSubnetCount + 1} referrals from same IP subnet (${subnet}) in 24 hours`,
        evidence: { ip, subnet, count: sameSubnetCount + 1 },
      })
    }

    return null
  }

  async checkVpnProxy(ip: string, referralId: string): Promise<FraudFlag | null> {
    // Basic local detection: check against known datacenter/private ranges
    const isPrivate = DATACENTER_SUBNETS.some((prefix) => ip.startsWith(prefix))

    if (isPrivate) {
      return this.fraudFlagRepository.create({
        referralId,
        type: FraudFlagType.VPN_PROXY,
        severity: FraudFlagSeverity.MEDIUM,
        status: FraudFlagStatus.OPEN,
        description: `Registration from suspected private/datacenter IP: ${ip}`,
        evidence: { ip },
      })
    }

    return null
  }

  async checkVelocity(referrerId: string, referralId: string): Promise<FraudFlag | null> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const dailyCount = await this.referralRepository.count({
      where: {
        referrerId,
        createdAt: MoreThan(oneDayAgo),
        status: ReferralStatus.VALIDATING,
      },
    })

    const weeklyCount = await this.referralRepository.count({
      where: {
        referrerId,
        createdAt: MoreThan(oneWeekAgo),
        status: ReferralStatus.VALIDATING,
      },
    })

    if (dailyCount >= 5) {
      return this.fraudFlagRepository.create({
        userId: referrerId,
        referralId,
        type: FraudFlagType.VELOCITY_EXCEEDED,
        severity: FraudFlagSeverity.HIGH,
        status: FraudFlagStatus.OPEN,
        description: `Referrer exceeded daily limit: ${dailyCount + 1} referrals in 24 hours (max 5)`,
        evidence: { dailyCount: dailyCount + 1, weeklyCount },
      })
    }

    if (weeklyCount >= 20) {
      return this.fraudFlagRepository.create({
        userId: referrerId,
        referralId,
        type: FraudFlagType.VELOCITY_EXCEEDED,
        severity: FraudFlagSeverity.MEDIUM,
        status: FraudFlagStatus.OPEN,
        description: `Referrer exceeded weekly limit: ${weeklyCount + 1} referrals in 7 days (max 20)`,
        evidence: { dailyCount, weeklyCount: weeklyCount + 1 },
      })
    }

    return null
  }

  async checkCircularReferral(
    referrerId: string,
    referredUserId: string,
    referralId: string,
  ): Promise<FraudFlag | null> {
    // Walk up the referral chain from the referrer to check if referred user is an ancestor
    let currentUserId = referrerId
    const visited = new Set<string>()

    for (let depth = 0; depth < 3; depth++) {
      if (visited.has(currentUserId)) break
      visited.add(currentUserId)

      const user = await this.userRepository.findOne({ where: { id: currentUserId } })
      if (!user || !user.referredBy) break

      // referredBy stores the referral ID, get the referrer from that
      const parentReferral = await this.referralRepository.findOne({ where: { id: user.referredBy } })
      if (!parentReferral) break

      if (parentReferral.referrerId === referredUserId) {
        return this.fraudFlagRepository.create({
          userId: referrerId,
          referralId,
          type: FraudFlagType.CIRCULAR_REFERRAL,
          severity: FraudFlagSeverity.CRITICAL,
          status: FraudFlagStatus.OPEN,
          description: `Circular referral detected at depth ${depth + 1}`,
          evidence: { referrerId, referredUserId, depth: depth + 1, chain: Array.from(visited) },
        })
      }

      currentUserId = parentReferral.referrerId
    }

    return null
  }

  async saveDeviceFingerprint(
    userId: string,
    fingerprintHash: string,
    ip: string,
    components?: Record<string, any>,
    userAgent?: string,
  ): Promise<DeviceFingerprint> {
    const fingerprint = this.deviceFingerprintRepository.create({
      userId,
      fingerprintHash,
      ip,
      ipSubnet: this.extractIpSubnet(ip),
      components,
      userAgent,
      isVpn: false,
      isProxy: false,
      isDatacenter: DATACENTER_SUBNETS.some((prefix) => ip?.startsWith(prefix)),
    })
    return this.deviceFingerprintRepository.save(fingerprint)
  }

  // Admin methods
  async getFraudFlags(page = 1, limit = 20, status?: FraudFlagStatus) {
    const where: any = {}
    if (status) where.status = status

    const [flags, total] = await this.fraudFlagRepository.findAndCount({
      where,
      relations: ["user", "referral"],
      order: { createdAt: "DESC" },
      take: limit,
      skip: (page - 1) * limit,
    })

    return { data: flags, total, page, limit, hasNext: page * limit < total, hasPrev: page > 1 }
  }

  async resolveFraudFlag(flagId: string, status: FraudFlagStatus, resolution: string): Promise<FraudFlag> {
    const flag = await this.fraudFlagRepository.findOne({ where: { id: flagId } })
    if (!flag) throw new Error("Fraud flag not found")

    flag.status = status
    flag.resolution = resolution
    return this.fraudFlagRepository.save(flag)
  }
}
