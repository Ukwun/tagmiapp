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
exports.ContentRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const content_entity_1 = require("../entities/content.entity");
let ContentRepository = class ContentRepository {
    constructor(repository) {
        this.repository = repository;
    }
    async find(options) {
        return this.repository.find(options);
    }
    async findOne(options) {
        return this.repository.findOne(options);
    }
    create(data) {
        return this.repository.create(data);
    }
    async save(content) {
        return this.repository.save(content);
    }
    async update(criteria, updates) {
        await this.repository.update(criteria, updates);
    }
    async remove(content) {
        return this.repository.remove(content);
    }
    createQueryBuilder(alias = "content") {
        return this.repository.createQueryBuilder(alias);
    }
    async count(options) {
        return this.repository.count(options);
    }
    async query(sql, parameters) {
        return this.repository.query(sql, parameters);
    }
};
exports.ContentRepository = ContentRepository;
exports.ContentRepository = ContentRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(content_entity_1.Content)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ContentRepository);
//# sourceMappingURL=content.repository.js.map