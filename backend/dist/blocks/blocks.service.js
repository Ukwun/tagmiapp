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
exports.BlocksService = void 0;
const common_1 = require("@nestjs/common");
const block_repository_1 = require("./repositories/block.repository");
const user_repository_1 = require("../users/repositories/user.repository");
let BlocksService = class BlocksService {
    constructor(blockRepository, userRepository) {
        this.blockRepository = blockRepository;
        this.userRepository = userRepository;
    }
    async blockUser(blockerId, blockedId) {
        if (blockerId === blockedId) {
            throw new common_1.ConflictException("You cannot block yourself");
        }
        const [blocker, blocked] = await Promise.all([
            this.userRepository.findByIdOptional(blockerId),
            this.userRepository.findByIdOptional(blockedId),
        ]);
        if (!blocker || !blocked) {
            throw new common_1.NotFoundException("User not found");
        }
        const existingBlock = await this.blockRepository.findOne({
            where: { blockerId, blockedId },
        });
        if (existingBlock) {
            throw new common_1.ConflictException("You have already blocked this user");
        }
        const block = this.blockRepository.create({ blockerId, blockedId });
        await this.blockRepository.save(block);
        return { success: true, message: "User blocked successfully" };
    }
    async unblockUser(blockerId, blockedId) {
        const block = await this.blockRepository.findOne({
            where: { blockerId, blockedId },
        });
        if (!block) {
            throw new common_1.NotFoundException("Block not found");
        }
        await this.blockRepository.remove(block);
        return { success: true, message: "User unblocked successfully" };
    }
    async getBlockedUsers(userId, page = 1, limit = 20) {
        const [blocks, total] = await this.blockRepository.findAndCount({
            where: { blockerId: userId },
            relations: ["blocked"],
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: "DESC" },
        });
        const blockedUsers = blocks.map((block) => ({
            id: block.blocked.id,
            username: block.blocked.username,
            displayName: block.blocked.displayName,
            avatarUrl: block.blocked.avatarUrl,
            blockedAt: block.createdAt,
        }));
        return {
            data: blockedUsers,
            total,
            page,
            limit,
            hasNext: page * limit < total,
            hasPrev: page > 1,
        };
    }
    async isBlocked(blockerId, blockedId) {
        const block = await this.blockRepository.findOne({
            where: { blockerId, blockedId },
        });
        return !!block;
    }
    async isBlockedByEither(userId1, userId2) {
        const blocks = await this.blockRepository.find({
            where: [
                { blockerId: userId1, blockedId: userId2 },
                { blockerId: userId2, blockedId: userId1 },
            ],
        });
        return blocks.length > 0;
    }
    async getBlockedUserIds(userId) {
        const blocks = await this.blockRepository.find({
            where: { blockerId: userId },
            select: ["blockedId"],
        });
        return blocks.map((b) => b.blockedId);
    }
    async getUsersWhoBlockedMe(userId) {
        const blocks = await this.blockRepository.find({
            where: { blockedId: userId },
            select: ["blockerId"],
        });
        return blocks.map((b) => b.blockerId);
    }
};
exports.BlocksService = BlocksService;
exports.BlocksService = BlocksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [block_repository_1.BlockRepository,
        user_repository_1.UserRepository])
], BlocksService);
//# sourceMappingURL=blocks.service.js.map