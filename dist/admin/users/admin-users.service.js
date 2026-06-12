"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUsersService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const user_repository_1 = require("../../users/repositories/user.repository");
const content_repository_1 = require("../../content/repositories/content.repository");
const report_repository_1 = require("../../reports/repositories/report.repository");
const booking_repository_1 = require("../../bookings/repositories/booking.repository");
let AdminUsersService = class AdminUsersService {
    constructor(userRepo, contentRepo, reportRepo, bookingRepo, configService) {
        this.userRepo = userRepo;
        this.contentRepo = contentRepo;
        this.reportRepo = reportRepo;
        this.bookingRepo = bookingRepo;
        this.configService = configService;
        this.superAdminEmail = this.configService.get("SUPER_ADMIN_EMAIL") || "";
    }
    isSuperAdmin(user) {
        return !!this.superAdminEmail && user.email === this.superAdminEmail;
    }
    async getUsers(query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const qb = this.userRepo
            .createQueryBuilder("u")
            .select([
            "u.id", "u.email", "u.username", "u.displayName", "u.role",
            "u.avatarUrl", "u.isActive", "u.isVerified", "u.lastLogin",
            "u.followersCount", "u.followingCount", "u.postCount",
            "u.createdAt",
        ]);
        if (query.search) {
            qb.andWhere("(u.username ILIKE :s OR u.email ILIKE :s OR u.displayName ILIKE :s)", { s: `%${query.search}%` });
        }
        if (query.role)
            qb.andWhere("u.role = :role", { role: query.role });
        if (query.isActive !== undefined)
            qb.andWhere("u.isActive = :ia", { ia: query.isActive });
        if (query.isVerified !== undefined)
            qb.andWhere("u.isVerified = :iv", { iv: query.isVerified });
        qb.orderBy("u.createdAt", "DESC")
            .skip((page - 1) * limit)
            .take(limit);
        const [data, total] = await qb.getManyAndCount();
        return { data, total, page, limit };
    }
    async getUserDetail(id) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException("User not found");
        const [reportCount, bookingCount, contentCount] = await Promise.all([
            this.reportRepo.count({ where: { targetUserId: id } }),
            this.bookingRepo
                .createQueryBuilder("b")
                .where("b.clientId = :id OR b.talentId = :id", { id })
                .getCount(),
            this.contentRepo.count({ where: { userId: id, sortOrder: 0 } }),
        ]);
        const { passwordHash, ...safeUser } = user;
        return { ...safeUser, reportCount, bookingCount, contentCount };
    }
    async getUserContent(id, page = 1, limit = 12) {
        const exists = await this.userRepo.findOne({ where: { id }, select: ["id"] });
        if (!exists)
            throw new common_1.NotFoundException("User not found");
        const [data, total] = await this.contentRepo
            .createQueryBuilder("c")
            .where("c.userId = :id AND c.sortOrder = 0", { id })
            .orderBy("c.createdAt", "DESC")
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
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
        };
    }
    async getUserBookings(id, page = 1, limit = 12) {
        const exists = await this.userRepo.findOne({ where: { id }, select: ["id"] });
        if (!exists)
            throw new common_1.NotFoundException("User not found");
        const [data, total] = await this.bookingRepo
            .createQueryBuilder("b")
            .leftJoinAndSelect("b.client", "client")
            .leftJoinAndSelect("b.talent", "talent")
            .where("b.clientId = :id OR b.talentId = :id", { id })
            .orderBy("b.createdAt", "DESC")
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
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
                userRole: b.clientId === id ? "client" : "talent",
                counterparty: b.clientId === id
                    ? (b.talent ? { id: b.talent.id, username: b.talent.username, displayName: b.talent.displayName, avatarUrl: b.talent.avatarUrl } : null)
                    : (b.client ? { id: b.client.id, username: b.client.username, displayName: b.client.displayName, avatarUrl: b.client.avatarUrl } : null),
            })),
            total,
            page,
            limit,
        };
    }
    async getUserEngagement(id) {
        const exists = await this.userRepo.findOne({ where: { id }, select: ["id"] });
        if (!exists)
            throw new common_1.NotFoundException("User not found");
        const totals = await this.contentRepo
            .createQueryBuilder("c")
            .select("COALESCE(SUM(c.viewCount), 0)", "totalViews")
            .addSelect("COALESCE(SUM(c.likeCount), 0)", "totalLikes")
            .addSelect("COALESCE(SUM(c.commentCount), 0)", "totalComments")
            .addSelect("COALESCE(SUM(c.shareCount), 0)", "totalShares")
            .addSelect("COALESCE(AVG(c.engagementScore), 0)", "avgEngagementScore")
            .addSelect("COUNT(*)", "postCount")
            .where("c.userId = :id AND c.sortOrder = 0", { id })
            .getRawOne();
        const breakdown = await this.contentRepo
            .createQueryBuilder("c")
            .select("c.contentType", "type")
            .addSelect("COUNT(*)", "count")
            .where("c.userId = :id AND c.sortOrder = 0", { id })
            .groupBy("c.contentType")
            .getRawMany();
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
        };
    }
    async toggleActive(id, dto, requestingUser) {
        const target = await this.userRepo.findOne({ where: { id } });
        if (!target)
            throw new common_1.NotFoundException("User not found");
        if (this.isSuperAdmin(target) && !dto.isActive) {
            throw new common_1.ForbiddenException("Cannot deactivate the super-admin account");
        }
        await this.userRepo.update(id, { isActive: dto.isActive });
        return { id, isActive: dto.isActive };
    }
    async toggleVerified(id, dto) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException("User not found");
        await this.userRepo.update(id, { isVerified: dto.isVerified });
        return { id, isVerified: dto.isVerified };
    }
    async changeRole(id, dto, requestingUser) {
        const target = await this.userRepo.findOne({ where: { id } });
        if (!target)
            throw new common_1.NotFoundException("User not found");
        if (dto.role === "manager" || target.role === "manager") {
            if (!this.isSuperAdmin(requestingUser)) {
                throw new common_1.ForbiddenException("Only the super-admin can promote or demote managers");
            }
        }
        if (this.isSuperAdmin(target)) {
            throw new common_1.ForbiddenException("Cannot change the super-admin's role");
        }
        await this.userRepo.update(id, { role: dto.role });
        return { id, role: dto.role };
    }
    async updateUser(id, dto, requestingUser) {
        const target = await this.userRepo.findOne({ where: { id } });
        if (!target)
            throw new common_1.NotFoundException("User not found");
        const updates = {};
        if (dto.displayName !== undefined)
            updates.displayName = dto.displayName;
        if (dto.username !== undefined)
            updates.username = dto.username;
        if (dto.bio !== undefined)
            updates.bio = dto.bio;
        if (Object.keys(updates).length === 0)
            return target;
        await this.userRepo.update(id, updates);
        const updated = await this.userRepo.findOne({ where: { id } });
        const { passwordHash, ...safeUser } = updated;
        return safeUser;
    }
    async deleteUser(id, requestingUser) {
        const target = await this.userRepo.findOne({ where: { id } });
        if (!target)
            throw new common_1.NotFoundException("User not found");
        if (this.isSuperAdmin(target)) {
            throw new common_1.ForbiddenException("Cannot delete the super-admin account");
        }
        await this.userRepo.update(id, {
            isActive: false,
            email: `deleted_${id}@removed.local`,
            username: `deleted_${id}`,
            displayName: "Deleted User",
            bio: null,
            avatarUrl: null,
            coverImageUrl: null,
        });
        await this.contentRepo.update({ userId: id }, { isActive: false });
        return { id, deleted: true };
    }
};
exports.AdminUsersService = AdminUsersService;
exports.AdminUsersService = AdminUsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_repository_1.UserRepository,
        content_repository_1.ContentRepository,
        report_repository_1.ReportRepository,
        booking_repository_1.BookingRepository,
        config_1.ConfigService])
], AdminUsersService);
//# sourceMappingURL=admin-users.service.js.map