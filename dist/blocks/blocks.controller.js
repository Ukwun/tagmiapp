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
exports.BlocksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const blocks_service_1 = require("./blocks.service");
let BlocksController = class BlocksController {
    constructor(blocksService) {
        this.blocksService = blocksService;
    }
    async blockUser(userId, req) {
        return this.blocksService.blockUser(req.user.id, userId);
    }
    async unblockUser(userId, req) {
        return this.blocksService.unblockUser(req.user.id, userId);
    }
    async getBlockedUsers(req, page, limit) {
        return this.blocksService.getBlockedUsers(req.user.id, page ? +page : 1, limit ? +limit : 20);
    }
    async isBlocked(userId, req) {
        const blocked = await this.blocksService.isBlocked(req.user.id, userId);
        return { blocked };
    }
};
exports.BlocksController = BlocksController;
__decorate([
    (0, common_1.Post)(":userId"),
    (0, swagger_1.ApiOperation)({ summary: "Block a user" }),
    __param(0, (0, common_1.Param)("userId")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BlocksController.prototype, "blockUser", null);
__decorate([
    (0, common_1.Delete)(":userId"),
    (0, swagger_1.ApiOperation)({ summary: "Unblock a user" }),
    __param(0, (0, common_1.Param)("userId")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BlocksController.prototype, "unblockUser", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "Get blocked users" }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)("page")),
    __param(2, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], BlocksController.prototype, "getBlockedUsers", null);
__decorate([
    (0, common_1.Get)("check/:userId"),
    (0, swagger_1.ApiOperation)({ summary: "Check if user is blocked" }),
    __param(0, (0, common_1.Param)("userId")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BlocksController.prototype, "isBlocked", null);
exports.BlocksController = BlocksController = __decorate([
    (0, swagger_1.ApiTags)("blocks"),
    (0, common_1.Controller)("blocks"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [blocks_service_1.BlocksService])
], BlocksController);
//# sourceMappingURL=blocks.controller.js.map