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
exports.AdminWalletsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const admin_guard_1 = require("../../auth/guards/admin.guard");
const wallet_service_1 = require("../../wallet/wallet.service");
const process_withdrawal_dto_1 = require("../../wallet/dto/process-withdrawal.dto");
let AdminWalletsController = class AdminWalletsController {
    constructor(walletService) {
        this.walletService = walletService;
    }
    async getAllWallets(page, limit) {
        return this.walletService.getAllWallets(page ? parseInt(page) : 1, limit ? parseInt(limit) : 20);
    }
    async getPendingWithdrawals(page, limit) {
        return this.walletService.getPendingWithdrawals(page ? parseInt(page) : 1, limit ? parseInt(limit) : 20);
    }
    async getWalletDetail(userId) {
        return this.walletService.getWallet(userId);
    }
    async freezeWallet(userId, body) {
        return this.walletService.freezeWallet(userId, body.reason);
    }
    async unfreezeWallet(userId) {
        return this.walletService.unfreezeWallet(userId);
    }
    async processWithdrawal(id, req, dto) {
        return this.walletService.processWithdrawal(id, req.user.id, dto.approve, dto.reason);
    }
};
exports.AdminWalletsController = AdminWalletsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "Get all wallets (paginated)" }),
    __param(0, (0, common_1.Query)("page")),
    __param(1, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminWalletsController.prototype, "getAllWallets", null);
__decorate([
    (0, common_1.Get)("withdrawals"),
    (0, swagger_1.ApiOperation)({ summary: "Get pending withdrawals" }),
    __param(0, (0, common_1.Query)("page")),
    __param(1, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminWalletsController.prototype, "getPendingWithdrawals", null);
__decorate([
    (0, common_1.Get)(":userId"),
    (0, swagger_1.ApiOperation)({ summary: "Get wallet detail for a specific user" }),
    __param(0, (0, common_1.Param)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminWalletsController.prototype, "getWalletDetail", null);
__decorate([
    (0, common_1.Post)(":userId/freeze"),
    (0, swagger_1.ApiOperation)({ summary: "Freeze a user wallet" }),
    __param(0, (0, common_1.Param)("userId")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminWalletsController.prototype, "freezeWallet", null);
__decorate([
    (0, common_1.Post)(":userId/unfreeze"),
    (0, swagger_1.ApiOperation)({ summary: "Unfreeze a user wallet" }),
    __param(0, (0, common_1.Param)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminWalletsController.prototype, "unfreezeWallet", null);
__decorate([
    (0, common_1.Post)("withdrawals/:id/process"),
    (0, swagger_1.ApiOperation)({ summary: "Process a withdrawal (approve/reject)" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, process_withdrawal_dto_1.ProcessWithdrawalDto]),
    __metadata("design:returntype", Promise)
], AdminWalletsController.prototype, "processWithdrawal", null);
exports.AdminWalletsController = AdminWalletsController = __decorate([
    (0, swagger_1.ApiTags)("Admin - Wallets"),
    (0, common_1.Controller)("admin/wallets"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [wallet_service_1.WalletService])
], AdminWalletsController);
//# sourceMappingURL=admin-wallets.controller.js.map