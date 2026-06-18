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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const update_user_dto_1 = require("./dto/update-user.dto");
const update_talent_profile_dto_1 = require("./dto/update-talent-profile.dto");
const update_settings_dto_1 = require("./dto/update-settings.dto");
const user_response_dto_1 = require("./dto/user-response.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const optional_jwt_auth_guard_1 = require("../auth/guards/optional-jwt-auth.guard");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async getProfile(req) {
        const user = await this.usersService.findById(req.user.id);
        return user_response_dto_1.UserProfileResponseDto.fromSafe(user);
    }
    async updateProfile(req, updateUserDto) {
        const user = await this.usersService.updateProfile(req.user.id, updateUserDto);
        return user_response_dto_1.UserProfileResponseDto.fromSafe(user);
    }
    async uploadAvatar(req, file) {
        return this.usersService.uploadAvatar(req.user.id, file);
    }
    async uploadCover(req, file) {
        return this.usersService.uploadCover(req.user.id, file);
    }
    async getTalentProfile(req) {
        return this.usersService.getTalentProfile(req.user.id);
    }
    async updateTalentProfile(req, updateTalentProfileDto) {
        return this.usersService.updateTalentProfile(req.user.id, updateTalentProfileDto);
    }
    async getSettings(req) {
        return this.usersService.getOrCreateSettings(req.user.id);
    }
    async updateSettings(req, dto) {
        return this.usersService.updateSettings(req.user.id, dto);
    }
    async deleteAccount(req) {
        await this.usersService.deleteAccount(req.user.id);
        return { message: "Account deleted successfully" };
    }
    async getSuggestedUsers(req, limit) {
        return this.usersService.getSuggestedUsers(req.user.id, limit || 5);
    }
    async searchUsers(req, query, limit) {
        return this.usersService.searchUsers(query, limit || 10, req.user?.id);
    }
    async searchTalents(req, query, skills, categories, page, limit) {
        return this.usersService.searchTalents(query, skills, categories, page ? Number.parseInt(page) : undefined, limit ? Number.parseInt(limit) : undefined, req.user?.id);
    }
    async getTalentProfileById(userId) {
        return this.usersService.getTalentProfile(userId);
    }
    async getPublicUserById(id) {
        const user = await this.usersService.findByIdOrUsername(id);
        return user_response_dto_1.UserProfileResponseDto.fromSafe(user);
    }
    async getUserById(id, req) {
        const user = await this.usersService.findByIdOrUsername(id);
        const settings = await this.usersService.getOrCreateSettings(user.id);
        const isOwnProfile = req.user?.id === user.id;
        return user_response_dto_1.UserProfileResponseDto.from(user, isOwnProfile, settings);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)("profile"),
    (0, swagger_1.ApiOperation)({ summary: "Get current user profile" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "User profile retrieved" }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)("profile"),
    (0, swagger_1.ApiOperation)({ summary: "Update user profile" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Profile updated successfully" }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)("avatar"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file")),
    (0, swagger_1.ApiConsumes)("multipart/form-data"),
    (0, swagger_1.ApiOperation)({ summary: "Upload user avatar" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Avatar uploaded successfully" }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadAvatar", null);
__decorate([
    (0, common_1.Post)("cover"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file")),
    (0, swagger_1.ApiConsumes)("multipart/form-data"),
    (0, swagger_1.ApiOperation)({ summary: "Upload user cover photo" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Cover photo uploaded successfully" }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadCover", null);
__decorate([
    (0, common_1.Get)("talent-profile"),
    (0, swagger_1.ApiOperation)({ summary: "Get current user talent profile" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Talent profile retrieved" }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getTalentProfile", null);
__decorate([
    (0, common_1.Put)("talent-profile"),
    (0, swagger_1.ApiOperation)({ summary: "Update talent profile" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Talent profile updated successfully" }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_talent_profile_dto_1.UpdateTalentProfileDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateTalentProfile", null);
__decorate([
    (0, common_1.Get)("settings"),
    (0, swagger_1.ApiOperation)({ summary: "Get user settings" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Settings retrieved" }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Put)("settings"),
    (0, swagger_1.ApiOperation)({ summary: "Update user settings" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Settings updated" }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_settings_dto_1.UpdateSettingsDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateSettings", null);
__decorate([
    (0, common_1.Delete)("account"),
    (0, swagger_1.ApiOperation)({ summary: "Delete user account" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Account deleted" }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteAccount", null);
__decorate([
    (0, common_1.Get)("suggested"),
    (0, swagger_1.ApiOperation)({ summary: "Get suggested users to follow" }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Suggested users retrieved" }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getSuggestedUsers", null);
__decorate([
    (0, common_1.Get)("search"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Search users for mentions" }),
    (0, swagger_1.ApiQuery)({ name: "q", required: true, description: "Search query" }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false, type: Number }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('q')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "searchUsers", null);
__decorate([
    (0, common_1.Get)("talents/search"),
    (0, swagger_1.ApiOperation)({ summary: "Search talents" }),
    (0, swagger_1.ApiQuery)({ name: "query", required: false }),
    (0, swagger_1.ApiQuery)({ name: "skills", required: false, type: [String] }),
    (0, swagger_1.ApiQuery)({ name: "categories", required: false, type: [String] }),
    (0, swagger_1.ApiQuery)({ name: "page", required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false, type: Number }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('query')),
    __param(2, (0, common_1.Query)('skills')),
    __param(3, (0, common_1.Query)('categories')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Array, Array, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "searchTalents", null);
__decorate([
    (0, common_1.Get)('talents/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get talent profile by user ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Talent profile retrieved' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getTalentProfileById", null);
__decorate([
    (0, common_1.Get)('public/:id'),
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get public user profile for SEO (no auth required)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Public profile retrieved' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getPublicUserById", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user profile by ID or username' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User profile retrieved' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserById", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)("Users"),
    (0, common_1.Controller)("users"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map