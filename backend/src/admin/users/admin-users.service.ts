import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { User } from "../../users/entities/user.entity"
import { UserSearchQueryDto, ToggleActiveDto, ToggleVerifiedDto, ChangeRoleDto, UpdateUserDto } from "./dto/admin-users.dto"
import { UserRepository } from "../../users/repositories/user.repository"
import { ContentRepository } from "../../content/repositories/content.repository"
import { ReportRepository } from "../../reports/repositories/report.repository"
import { BookingRepository } from "../../bookings/repositories/booking.repository"

@Injectable()
export class AdminUsersService {
  private readonly superAdminEmail: string

  constructor(
    private readonly userRepo: UserRepository,
    private readonly contentRepo: ContentRepository,
    private readonly reportRepo: ReportRepository,
    private readonly bookingRepo: BookingRepository,
    private readonly configService: ConfigService,
  ) {
    this.superAdminEmail = this.configService.get<string>("SUPER_ADMIN_EMAIL") || ""
  }

  isSuperAdmin(user: User): boolean {
    return !!this.superAdminEmail && user.email === this.superAdminEmail
  }

  async getUsers(query: UserSearchQueryDto) {
    const page = query.page || 1
    const limit = query.limit || 20

    const qb = this.userRepo
      .createQueryBuilder("u")
      .select([
        "u.id", "u.email", "u.username", "u.displayName", "u.role",
        "u.avatarUrl", "u.isActive", "u.isVerified", "u.lastLogin",
        "u.followersCount", "u.followingCount", "u.postCount",
        "u.createdAt",
      ])

    if (query.search) {
      qb.andWhere(
        "(u.username ILIKE :s OR u.email ILIKE :s OR u.displayName ILIKE :s)",
        { s: `%${query.search}%` },
      )
    }
    if (query.role) qb.andWhere("u.role = :role", { role: query.role })
    if (query.isActive !== undefined) qb.andWhere("u.isActive = :ia", { ia: query.isActive })
    if (query.isVerified !== undefined) qb.andWhere("u.isVerified = :iv", { iv: query.isVerified })

    qb.orderBy("u.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit)

    const [data, total] = await qb.getManyAndCount()
    return { data, total, page, limit }
  }

  async getUserDetail(id: string) {
    const user = await this.userRepo.findOne({ where: { id } })
    if (!user) throw new NotFoundException("User not found")

    const [reportCount, bookingCount, contentCount] = await Promise.all([
      this.reportRepo.count({ where: { targetUserId: id } }),
      this.bookingRepo
        .createQueryBuilder("b")
        .where("b.clientId = :id OR b.talentId = :id", { id })
        .getCount(),
      this.contentRepo.count({ where: { userId: id, sortOrder: 0 } }),
    ])

    const { passwordHash, ...safeUser } = user as any
    return { ...safeUser, reportCount, bookingCount, contentCount }
  }

  /** A user's posts (one row per post — the cover slide where sortOrder = 0) */
  async getUserContent(id: string, page = 1, limit = 12) {
    const exists = await this.userRepo.findOne({ where: { id }, select: ["id"] })
    if (!exists) throw new NotFoundException("User not found")

    const [data, total] = await this.contentRepo
      .createQueryBuilder("c")
      .where("c.userId = :id AND c.sortOrder = 0", { id })
      .orderBy("c.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    return {
      data: data.map((c) => ({
        id: c.id,
        postId: c.postId,
        contentType: c.contentType,
        caption: c.caption,
        thumbnailUrl: c.thumbnailUrl,
        mediaUrl: c.mediaUrl,
        viewCount: c.viewCount,
        likeCount: c.likeCount,
        commentCount: c.commentCount,
        shareCount: c.shareCount,
        engagementScore: c.engagementScore,
        isActive: c.isActive,
        createdAt: c.createdAt,
      })),
      total,
      page,
      limit,
    }
  }

  /** A user's bookings — both as client and as talent, tagged with the role they played */
  async getUserBookings(id: string, page = 1, limit = 12) {
    const exists = await this.userRepo.findOne({ where: { id }, select: ["id"] })
    if (!exists) throw new NotFoundException("User not found")

    const [data, total] = await this.bookingRepo
      .createQueryBuilder("b")
      .leftJoinAndSelect("b.client", "client")
      .leftJoinAndSelect("b.talent", "talent")
      .where("b.clientId = :id OR b.talentId = :id", { id })
      .orderBy("b.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    return {
      data: data.map((b) => ({
        id: b.id,
        title: b.title,
        status: b.status,
        bookingType: b.bookingType,
        price: b.price,
        finalAmount: b.finalAmount,
        startDate: b.startDate,
        endDate: b.endDate,
        createdAt: b.createdAt,
        // Which side of the booking this user is on
        userRole: b.clientId === id ? "client" : "talent",
        counterparty: b.clientId === id
          ? (b.talent ? { id: b.talent.id, username: b.talent.username, displayName: b.talent.displayName, avatarUrl: b.talent.avatarUrl } : null)
          : (b.client ? { id: b.client.id, username: b.client.username, displayName: b.client.displayName, avatarUrl: b.client.avatarUrl } : null),
      })),
      total,
      page,
      limit,
    }
  }

  /** Aggregate engagement totals across the user's content */
  async getUserEngagement(id: string) {
    const exists = await this.userRepo.findOne({ where: { id }, select: ["id"] })
    if (!exists) throw new NotFoundException("User not found")

    const totals = await this.contentRepo
      .createQueryBuilder("c")
      .select("COALESCE(SUM(c.viewCount), 0)", "totalViews")
      .addSelect("COALESCE(SUM(c.likeCount), 0)", "totalLikes")
      .addSelect("COALESCE(SUM(c.commentCount), 0)", "totalComments")
      .addSelect("COALESCE(SUM(c.shareCount), 0)", "totalShares")
      .addSelect("COALESCE(AVG(c.engagementScore), 0)", "avgEngagementScore")
      .addSelect("COUNT(*)", "postCount")
      .where("c.userId = :id AND c.sortOrder = 0", { id })
      .getRawOne()

    const breakdown = await this.contentRepo
      .createQueryBuilder("c")
      .select("c.contentType", "type")
      .addSelect("COUNT(*)", "count")
      .where("c.userId = :id AND c.sortOrder = 0", { id })
      .groupBy("c.contentType")
      .getRawMany()

    return {
      totals: {
        postCount: Number(totals?.postCount ?? 0),
        totalViews: Number(totals?.totalViews ?? 0),
        totalLikes: Number(totals?.totalLikes ?? 0),
        totalComments: Number(totals?.totalComments ?? 0),
        totalShares: Number(totals?.totalShares ?? 0),
        avgEngagementScore: Number(totals?.avgEngagementScore ?? 0),
      },
      typeBreakdown: breakdown.map((b) => ({ type: b.type, count: Number(b.count) })),
    }
  }

  async toggleActive(id: string, dto: ToggleActiveDto, requestingUser: User) {
    const target = await this.userRepo.findOne({ where: { id } })
    if (!target) throw new NotFoundException("User not found")

    // Cannot deactivate the super-admin
    if (this.isSuperAdmin(target) && !dto.isActive) {
      throw new ForbiddenException("Cannot deactivate the super-admin account")
    }

    await this.userRepo.update(id, { isActive: dto.isActive })
    return { id, isActive: dto.isActive }
  }

  async toggleVerified(id: string, dto: ToggleVerifiedDto) {
    const user = await this.userRepo.findOne({ where: { id } })
    if (!user) throw new NotFoundException("User not found")
    await this.userRepo.update(id, { isVerified: dto.isVerified })
    return { id, isVerified: dto.isVerified }
  }

  async changeRole(id: string, dto: ChangeRoleDto, requestingUser: User) {
    const target = await this.userRepo.findOne({ where: { id } })
    if (!target) throw new NotFoundException("User not found")

    // Only the super-admin can promote/demote to manager
    if (dto.role === "manager" || target.role === "manager") {
      if (!this.isSuperAdmin(requestingUser)) {
        throw new ForbiddenException("Only the super-admin can promote or demote managers")
      }
    }

    // Cannot change the super-admin's own role
    if (this.isSuperAdmin(target)) {
      throw new ForbiddenException("Cannot change the super-admin's role")
    }

    await this.userRepo.update(id, { role: dto.role as any })
    return { id, role: dto.role }
  }

  async updateUser(id: string, dto: UpdateUserDto, requestingUser: User) {
    const target = await this.userRepo.findOne({ where: { id } })
    if (!target) throw new NotFoundException("User not found")

    // Email is intentionally not updatable via any endpoint — emails are
    // permanently anchored to the account they were created with.
    const updates: Partial<User> = {}
    if (dto.displayName !== undefined) updates.displayName = dto.displayName
    if (dto.username !== undefined) updates.username = dto.username as any
    if (dto.bio !== undefined) updates.bio = dto.bio

    if (Object.keys(updates).length === 0) return target

    await this.userRepo.update(id, updates)
    const updated = await this.userRepo.findOne({ where: { id } })
    const { passwordHash, ...safeUser } = updated as any
    return safeUser
  }

  async deleteUser(id: string, requestingUser: User) {
    const target = await this.userRepo.findOne({ where: { id } })
    if (!target) throw new NotFoundException("User not found")

    if (this.isSuperAdmin(target)) {
      throw new ForbiddenException("Cannot delete the super-admin account")
    }

    // Soft-delete: deactivate and anonymize
    await this.userRepo.update(id, {
      isActive: false,
      email: `deleted_${id}@removed.local` as any,
      username: `deleted_${id}` as any,
      displayName: "Deleted User",
      bio: null,
      avatarUrl: null,
      coverImageUrl: null,
    })

    // Deactivate all their content
    await this.contentRepo.update({ userId: id }, { isActive: false })

    return { id, deleted: true }
  }
}
