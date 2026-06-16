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
exports.TalentProfileRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const talent_profile_entity_1 = require("../entities/talent-profile.entity");
const error_handler_1 = require("../../common/exceptions/error.handler");
const error_messages_constant_1 = require("../../common/constants/error-messages.constant");
let TalentProfileRepository = class TalentProfileRepository {
    constructor(repository) {
        this.repository = repository;
    }
    async findByUserId(userId) {
        const profile = await this.repository.findOne({
            where: { userId },
            relations: ["user"],
        });
        if (!profile) {
            error_handler_1.ErrorHandler.notFound(error_messages_constant_1.ERROR_MESSAGES.USER_NOT_FOUND);
        }
        return profile;
    }
    async findByUserIdOptional(userId) {
        return this.repository.findOne({ where: { userId } });
    }
    async save(profile) {
        return this.repository.save(profile);
    }
    async create(profileData) {
        const profile = this.repository.create(profileData);
        return this.repository.save(profile);
    }
    async searchTalents(query, skills, categories, page = 1, limit = 20, excludeUserId) {
        const queryBuilder = this.repository
            .createQueryBuilder("talent")
            .innerJoinAndSelect("talent.user", "user")
            .where("talent.isBookable = :isBookable", { isBookable: true })
            .andWhere("user.isActive = :isActive", { isActive: true });
        if (excludeUserId) {
            queryBuilder.andWhere("user.id != :excludeUserId", { excludeUserId });
        }
        if (query) {
            queryBuilder.andWhere("(user.displayName ILIKE :query OR user.username ILIKE :query OR user.bio ILIKE :query)", { query: `%${query}%` });
        }
        const categoryList = categories ? (Array.isArray(categories) ? categories : [categories]) : [];
        if (categoryList.length > 0) {
            const categoryConditions = categoryList.map((_, i) => `EXISTS (SELECT 1 FROM jsonb_array_elements_text(talent.categories::jsonb) AS elem WHERE LOWER(elem) = LOWER(:cat${i}))`);
            const categoryParams = {};
            categoryList.forEach((cat, i) => {
                categoryParams[`cat${i}`] = cat;
            });
            queryBuilder.andWhere(`(${categoryConditions.join(" OR ")})`, categoryParams);
        }
        return queryBuilder
            .orderBy("user.followersCount", "DESC")
            .addOrderBy("user.createdAt", "DESC")
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
    }
};
exports.TalentProfileRepository = TalentProfileRepository;
exports.TalentProfileRepository = TalentProfileRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(talent_profile_entity_1.TalentProfile)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TalentProfileRepository);
//# sourceMappingURL=talent-profile.repository.js.map