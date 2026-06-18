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
exports.AdminUsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const admin_guard_1 = require("../../auth/guards/admin.guard");
const admin_users_service_1 = require("./admin-users.service");
const admin_users_dto_1 = require("./dto/admin-users.dto");
let AdminUsersController = class AdminUsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async getUsers(query) {
        return this.usersService.getUsers(query);
    }
    async getUserDetail(id) {
        return this.usersService.getUserDetail(id);
    }
    async getUserContent(id, page, limit) {
        return this.usersService.getUserContent(id, Number(page) || 1, Number(limit) || 12);
    }
    async getUserBookings(id, page, limit) {
        return this.usersService.getUserBookings(id, Number(page) || 1, Number(limit) || 12);
    }
    async getUserEngagement(id) {
        return this.usersService.getUserEngagement(id);
    }
    async toggleActive(id, dto, req) {
        return this.usersService.toggleActive(id, dto, req.user);
    }
    async toggleVerified(id, dto) {
        return this.usersService.toggleVerified(id, dto);
    }
    async changeRole(id, dto, req) {
        return this.usersService.changeRole(id, dto, req.user);
    }
    async updateUser(id, dto, req) {
        return this.usersService.updateUser(id, dto, req.user);
    }
    async deleteUser(id, req) {
        return this.usersService.deleteUser(id, req.user);
    }
};
exports.AdminUsersController = AdminUsersController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "List all users with search and filters" }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_users_dto_1.UserSearchQueryDto]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Get user detail with related counts" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "getUserDetail", null);
__decorate([
    (0, common_1.Get)(":id/content"),
    (0, swagger_1.ApiOperation)({ summary: "Get a user's content posts (paginated)" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("page")),
    __param(2, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "getUserContent", null);
__decorate([
    (0, common_1.Get)(":id/bookings"),
    (0, swagger_1.ApiOperation)({ summary: "Get a user's bookings (as client and talent)" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("page")),
    __param(2, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "getUserBookings", null);
__decorate([
    (0, common_1.Get)(":id/engagement"),
    (0, swagger_1.ApiOperation)({ summary: "Get aggregated engagement totals for a user" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "getUserEngagement", null);
__decorate([
    (0, common_1.Patch)(":id/active"),
    (0, swagger_1.ApiOperation)({ summary: "Toggle user active status" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_users_dto_1.ToggleActiveDto, Object]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "toggleActive", null);
__decorate([
    (0, common_1.Patch)(":id/verified"),
    (0, swagger_1.ApiOperation)({ summary: "Toggle user verified status" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_users_dto_1.ToggleVerifiedDto]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "toggleVerified", null);
__decorate([
    (0, common_1.Patch)(":id/role"),
    (0, swagger_1.ApiOperation)({ summary: "Change user role (only super-admin can promote to manager)" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_users_dto_1.ChangeRoleDto, Object]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "changeRole", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Update user details (displayName, username, email, bio)" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_users_dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Soft-delete user (anonymize and deactivate)" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "deleteUser", null);
exports.AdminUsersController = AdminUsersController = __decorate([
    (0, swagger_1.ApiTags)("Admin - Users"),
    (0, common_1.Controller)("admin/users"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [admin_users_service_1.AdminUsersService])
], AdminUsersController);
//# sourceMappingURL=admin-users.controller.js.map