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
exports.DraftController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const draft_service_1 = require("./draft.service");
let DraftController = class DraftController {
    constructor(draftService) {
        this.draftService = draftService;
    }
    async createDraft(req, dto) {
        return this.draftService.createDraft(req.user.id, dto);
    }
    async updateDraft(id, req, dto) {
        return this.draftService.updateDraft(id, req.user.id, dto);
    }
    async listDrafts(req) {
        return this.draftService.listDrafts(req.user.id);
    }
    async getDraft(id, req) {
        return this.draftService.getDraft(id, req.user.id);
    }
    async deleteDraft(id, req) {
        await this.draftService.deleteDraft(id, req.user.id);
        return { message: "Draft deleted" };
    }
};
exports.DraftController = DraftController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: "Create a draft (metadata only, no file uploads)" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Draft created" }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DraftController.prototype, "createDraft", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Update a draft (metadata only)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Draft updated" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DraftController.prototype, "updateDraft", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "List user drafts" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Drafts listed" }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DraftController.prototype, "listDrafts", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Get a draft" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Draft retrieved" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DraftController.prototype, "getDraft", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Delete a draft" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Draft deleted" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DraftController.prototype, "deleteDraft", null);
exports.DraftController = DraftController = __decorate([
    (0, swagger_1.ApiTags)("Drafts"),
    (0, common_1.Controller)("content/drafts"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [draft_service_1.DraftService])
], DraftController);
//# sourceMappingURL=draft.controller.js.map