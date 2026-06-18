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
var DraftService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DraftService = void 0;
const common_1 = require("@nestjs/common");
const draft_repository_1 = require("./repositories/draft.repository");
let DraftService = DraftService_1 = class DraftService {
    constructor(draftRepository) {
        this.draftRepository = draftRepository;
        this.logger = new common_1.Logger(DraftService_1.name);
    }
    async createDraft(userId, dto) {
        const slides = this.buildSlides(dto);
        const draft = this.draftRepository.create({
            userId,
            slides,
            hashtags: dto.hashtags || [],
            status: "saved",
        });
        return this.draftRepository.save(draft);
    }
    async updateDraft(draftId, userId, dto) {
        const draft = await this.draftRepository.findOne({ where: { id: draftId, userId } });
        if (!draft)
            throw new common_1.NotFoundException("Draft not found");
        draft.slides = this.buildSlides(dto);
        draft.hashtags = dto.hashtags || draft.hashtags;
        draft.status = "saved";
        return this.draftRepository.save(draft);
    }
    async listDrafts(userId) {
        return this.draftRepository.find({
            where: { userId },
            order: { updatedAt: "DESC" },
        });
    }
    async getDraft(draftId, userId) {
        const draft = await this.draftRepository.findOne({ where: { id: draftId, userId } });
        if (!draft)
            throw new common_1.NotFoundException("Draft not found");
        return draft;
    }
    async deleteDraft(draftId, userId) {
        const draft = await this.draftRepository.findOne({ where: { id: draftId, userId } });
        if (!draft)
            throw new common_1.NotFoundException("Draft not found");
        await this.draftRepository.remove(draft);
    }
    buildSlides(dto) {
        const slides = Array.isArray(dto.slides) ? dto.slides : [];
        if (slides.length > 0) {
            return slides.map((s, i) => ({
                type: s.type || "text",
                text: s.text,
                caption: s.caption,
                backgroundColor: s.backgroundColor,
                fontStyle: s.fontStyle,
                musicName: s.musicName,
                musicTrimStart: s.musicTrimStart,
                musicTrimEnd: s.musicTrimEnd,
                hasMediaFile: s.hasMediaFile || false,
                hasMusicFile: s.hasMusicFile || false,
                sortOrder: i,
            }));
        }
        return [];
    }
};
exports.DraftService = DraftService;
exports.DraftService = DraftService = DraftService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [draft_repository_1.DraftRepository])
], DraftService);
//# sourceMappingURL=draft.service.js.map