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
exports.ReferralRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const referral_entity_1 = require("../entities/referral.entity");
let ReferralRepository = class ReferralRepository {
    constructor(repository) {
        this.repository = repository;
    }
    async find(options) {
        return this.repository.find(options);
    }
    async findOne(options) {
        return this.repository.findOne(options);
    }
    async findAndCount(options) {
        return this.repository.findAndCount(options);
    }
    async count(options) {
        return this.repository.count(options);
    }
    create(data) {
        return this.repository.create(data);
    }
    async save(referral) {
        return this.repository.save(referral);
    }
    async remove(referral) {
        return this.repository.remove(referral);
    }
    async update(criteria, updates) {
        await this.repository.update(criteria, updates);
    }
    createQueryBuilder(alias) {
        return this.repository.createQueryBuilder(alias);
    }
    get manager() {
        return this.repository.manager;
    }
};
exports.ReferralRepository = ReferralRepository;
exports.ReferralRepository = ReferralRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(referral_entity_1.Referral)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ReferralRepository);
//# sourceMappingURL=referral.repository.js.map