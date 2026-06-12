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
exports.CategorizationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const categorization_service_1 = require("./categorization.service");
let CategorizationController = class CategorizationController {
    constructor(categorizationService) {
        this.categorizationService = categorizationService;
    }
    async categorize(body) {
        return this.categorizationService.categorize(body.text, body.topK);
    }
    async categorizeContent(id) {
        return this.categorizationService.categorizeByContentId(id);
    }
    getCategories() {
        return this.categorizationService.getCategories();
    }
};
exports.CategorizationController = CategorizationController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: "Categorize text content into predefined categories" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CategorizationController.prototype, "categorize", null);
__decorate([
    (0, common_1.Post)("content/:id"),
    (0, swagger_1.ApiOperation)({ summary: "Categorize a content item using all available enriched text" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CategorizationController.prototype, "categorizeContent", null);
__decorate([
    (0, common_1.Get)("categories"),
    (0, swagger_1.ApiOperation)({ summary: "Get list of available categories" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CategorizationController.prototype, "getCategories", null);
exports.CategorizationController = CategorizationController = __decorate([
    (0, swagger_1.ApiTags)("AI - Categorization"),
    (0, common_1.Controller)("ai/categorize"),
    __metadata("design:paramtypes", [categorization_service_1.CategorizationService])
], CategorizationController);
//# sourceMappingURL=categorization.controller.js.map