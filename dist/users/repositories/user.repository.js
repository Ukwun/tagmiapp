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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entities/user.entity");
const error_handler_1 = require("../../common/exceptions/error.handler");
const error_messages_constant_1 = require("../../common/constants/error-messages.constant");
let UserRepository = class UserRepository {
    constructor(repository) {
        this.repository = repository;
    }
    async findById(id) {
        const user = await this.repository.findOne({ where: { id } });
        if (!user) {
            error_handler_1.ErrorHandler.notFound(error_messages_constant_1.ERROR_MESSAGES.USER_NOT_FOUND);
        }
        return user;
    }
    async findByIdOptional(id) {
        return this.repository.findOne({ where: { id } });
    }
    async findByUsername(username) {
        const user = await this.repository.findOne({ where: { username } });
        if (!user) {
            error_handler_1.ErrorHandler.notFound(error_messages_constant_1.ERROR_MESSAGES.USER_NOT_FOUND);
        }
        return user;
    }
    async findByUsernameOptional(username) {
        return this.repository.findOne({ where: { username } });
    }
    async findByEmail(email) {
        return this.repository.findOne({ where: { email: (0, typeorm_2.ILike)(email) } });
    }
    async findByEmailOrUsername(emailOrUsername) {
        const value = emailOrUsername.toLowerCase().trim();
        return this.repository.findOne({
            where: [{ email: (0, typeorm_2.ILike)(value) }, { username: (0, typeorm_2.ILike)(value) }],
        });
    }
    async findByEmailOrUsernameWithPassword(emailOrUsername) {
        const value = emailOrUsername.toLowerCase().trim();
        return this.repository.findOne({
            where: [{ email: (0, typeorm_2.ILike)(value) }, { username: (0, typeorm_2.ILike)(value) }],
            select: [
                "id",
                "email",
                "username",
                "displayName",
                "avatarUrl",
                "coverImageUrl",
                "bio",
                "gender",
                "dateOfBirth",
                "location",
                "interests",
                "role",
                "isVerified",
                "isActive",
                "createdAt",
                "passwordHash",
            ],
        });
    }
    async update(id, updates) {
        await this.repository.update(id, updates);
    }
    async findByUsernames(usernames) {
        if (usernames.length === 0) {
            return [];
        }
        return this.repository.find({
            where: usernames.map(username => ({ username })),
        });
    }
    async save(user) {
        return this.repository.save(user);
    }
    async create(userData) {
        const user = this.repository.create(userData);
        return this.repository.save(user);
    }
    async searchUsers(query, limit) {
        return this.repository
            .createQueryBuilder("user")
            .where("user.isActive = :isActive", { isActive: true })
            .andWhere("(user.username ILIKE :query OR user.displayName ILIKE :query)", { query: `%${query}%` })
            .select([
            "user.id",
            "user.username",
            "user.displayName",
            "user.avatarUrl",
            "user.isVerified",
            "user.followersCount",
        ])
            .orderBy("user.followersCount", "DESC")
            .limit(limit)
            .getMany();
    }
    async findSuggestedUsers(excludeIds, limit) {
        return this.repository
            .createQueryBuilder("user")
            .where("user.isActive = :isActive", { isActive: true })
            .andWhere("user.id NOT IN (:...excludeIds)", { excludeIds })
            .select([
            "user.id",
            "user.username",
            "user.displayName",
            "user.avatarUrl",
            "user.bio",
            "user.isVerified",
            "user.followersCount",
        ])
            .orderBy("user.followersCount", "DESC")
            .limit(limit)
            .getMany();
    }
    createQueryBuilder(alias) {
        return this.repository.createQueryBuilder(alias);
    }
    async findOne(options) {
        return this.repository.findOne(options);
    }
    async count(options) {
        return this.repository.count(options);
    }
    async findByIds(ids) {
        if (ids.length === 0) {
            return [];
        }
        return this.repository.find({
            where: ids.map(id => ({ id })),
        });
    }
};
exports.UserRepository = UserRepository;
exports.UserRepository = UserRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserRepository);
//# sourceMappingURL=user.repository.js.map