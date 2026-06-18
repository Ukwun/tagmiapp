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
exports.UserPreferenceRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_category_preference_entity_1 = require("../entities/user-category-preference.entity");
let UserPreferenceRepository = class UserPreferenceRepository {
    constructor(repository) {
        this.repository = repository;
    }
    async findByUserId(userId) {
        return this.repository.find({
            where: { userId },
            order: { affinityScore: "DESC" },
        });
    }
    async findOne(userId, category) {
        return this.repository.findOne({
            where: { userId, category },
        });
    }
    async create(data) {
        const preference = this.repository.create(data);
        return this.repository.save(preference);
    }
    async update(id, data) {
        await this.repository.update(id, data);
    }
    async upsert(userId, category, data) {
        await this.repository.upsert({
            userId,
            category,
            ...data,
        }, ["userId", "category"]);
    }
    async getTopPreferences(userId, limit = 10) {
        return this.repository.find({
            where: { userId },
            order: { affinityScore: "DESC" },
            take: limit,
        });
    }
    async seedFromInterests(userId, interests) {
        if (!interests || interests.length === 0)
            return;
        const preferences = interests.map((category) => ({
            userId,
            category,
            affinityScore: 0.7,
            engagementCount: 0,
            lastEngagementAt: null,
        }));
        for (const pref of preferences) {
            await this.upsert(userId, pref.category, pref);
        }
    }
    async deleteByUserId(userId) {
        await this.repository.delete({ userId });
    }
    createQueryBuilder(alias = "preference") {
        return this.repository.createQueryBuilder(alias);
    }
};
exports.UserPreferenceRepository = UserPreferenceRepository;
exports.UserPreferenceRepository = UserPreferenceRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_category_preference_entity_1.UserCategoryPreference)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserPreferenceRepository);
//# sourceMappingURL=user-preference.repository.js.map