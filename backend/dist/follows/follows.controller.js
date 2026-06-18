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
exports.FollowsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const follows_service_1 = require("./follows.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let FollowsController = class FollowsController {
    constructor(followsService) {
        this.followsService = followsService;
    }
    async followUser(req, userId) {
        return this.followsService.followUser(req.user.id, userId);
    }
    async unfollowUser(req, userId) {
        return this.followsService.unfollowUser(req.user.id, userId);
    }
    async getFollowers(req, userId, page, limit) {
        const currentUserId = req.user?.id;
        return this.followsService.getFollowers(userId, Number.parseInt(page) || 1, Number.parseInt(limit) || 20, currentUserId);
    }
    async getFollowing(userId, page, limit) {
        return this.followsService.getFollowing(userId, Number.parseInt(page) || 1, Number.parseInt(limit) || 20);
    }
    async checkFollowing(req, userId) {
        const [isFollowing, followsYou] = await Promise.all([
            this.followsService.isFollowing(req.user.id, userId),
            this.followsService.isFollowing(userId, req.user.id),
        ]);
        return { isFollowing, followsYou };
    }
    async getFollowStats(userId) {
        return this.followsService.getFollowStats(userId);
    }
};
exports.FollowsController = FollowsController;
__decorate([
    (0, common_1.Post)(":userId"),
    (0, swagger_1.ApiOperation)({ summary: "Follow a user" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Successfully followed user" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "User not found" }),
    (0, swagger_1.ApiResponse)({ status: 409, description: "Already following this user" }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "followUser", null);
__decorate([
    (0, common_1.Delete)(":userId"),
    (0, swagger_1.ApiOperation)({ summary: "Unfollow a user" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Successfully unfollowed user" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Not following this user" }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "unfollowUser", null);
__decorate([
    (0, common_1.Get)("followers/:userId"),
    (0, swagger_1.ApiOperation)({ summary: "Get user's followers" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "List of followers retrieved" }),
    (0, swagger_1.ApiQuery)({ name: "page", required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false, type: Number }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("userId")),
    __param(2, (0, common_1.Query)("page")),
    __param(3, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "getFollowers", null);
__decorate([
    (0, common_1.Get)("following/:userId"),
    (0, swagger_1.ApiOperation)({ summary: "Get users that a user is following" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "List of following retrieved" }),
    (0, swagger_1.ApiQuery)({ name: "page", required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false, type: Number }),
    __param(0, (0, common_1.Param)("userId")),
    __param(1, (0, common_1.Query)("page")),
    __param(2, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "getFollowing", null);
__decorate([
    (0, common_1.Get)("check/:userId"),
    (0, swagger_1.ApiOperation)({ summary: "Check if current user is following another user" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Follow status retrieved" }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "checkFollowing", null);
__decorate([
    (0, common_1.Get)("stats/:userId"),
    (0, swagger_1.ApiOperation)({ summary: "Get follow statistics for a user" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Follow stats retrieved" }),
    __param(0, (0, common_1.Param)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "getFollowStats", null);
exports.FollowsController = FollowsController = __decorate([
    (0, swagger_1.ApiTags)("Follows"),
    (0, common_1.Controller)("follows"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [follows_service_1.FollowsService])
], FollowsController);
//# sourceMappingURL=follows.controller.js.map