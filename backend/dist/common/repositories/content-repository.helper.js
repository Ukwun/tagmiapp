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
exports.ContentRepositoryHelper = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const content_entity_1 = require("../../content/entities/content.entity");
let ContentRepositoryHelper = class ContentRepositoryHelper {
    constructor(contentRepository) {
        this.contentRepository = contentRepository;
    }
    async findByIdOrFail(id, options = {}) {
        const relations = this.buildRelations(options);
        const content = await this.contentRepository.findOne({
            where: { id },
            relations,
        });
        if (!content) {
            throw new common_1.NotFoundException("Content not found");
        }
        return content;
    }
    async findById(id, options = {}) {
        const relations = this.buildRelations(options);
        return this.contentRepository.findOne({
            where: { id },
            relations,
        });
    }
    async findByUser(userId, options = {}) {
        const relations = this.buildRelations(options);
        return this.contentRepository.find({
            where: { userId },
            relations,
            order: { createdAt: "DESC" },
        });
    }
    async findRecent(options = {}) {
        const relations = this.buildRelations(options);
        return this.contentRepository.find({
            relations,
            order: { createdAt: "DESC" },
        });
    }
    buildRelations(options) {
        const relations = [];
        if (options.includeAuthor)
            relations.push("user");
        if (options.includeSlides)
            relations.push("slides");
        if (options.includeInteractions) {
            relations.push("likes", "bookmarks", "views");
        }
        if (options.includeComments) {
            relations.push("comments", "comments.user");
        }
        return relations;
    }
};
exports.ContentRepositoryHelper = ContentRepositoryHelper;
exports.ContentRepositoryHelper = ContentRepositoryHelper = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(content_entity_1.Content)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ContentRepositoryHelper);
//# sourceMappingURL=content-repository.helper.js.map