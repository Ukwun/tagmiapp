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
exports.AdminReportsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const admin_guard_1 = require("../../auth/guards/admin.guard");
const admin_reports_service_1 = require("./admin-reports.service");
const admin_reports_dto_1 = require("./dto/admin-reports.dto");
let AdminReportsController = class AdminReportsController {
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    async getReports(query) {
        return this.reportsService.getReports(query);
    }
    async getReportDetail(id) {
        return this.reportsService.getReportDetail(id);
    }
    async resolveReport(id, dto) {
        return this.reportsService.resolveReport(id, dto);
    }
    async deleteReport(id) {
        return this.reportsService.deleteReport(id);
    }
};
exports.AdminReportsController = AdminReportsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "List reports with filters (pending first)" }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_reports_dto_1.ReportSearchQueryDto]),
    __metadata("design:returntype", Promise)
], AdminReportsController.prototype, "getReports", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Get report detail with target entity" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminReportsController.prototype, "getReportDetail", null);
__decorate([
    (0, common_1.Patch)(":id/resolve"),
    (0, swagger_1.ApiOperation)({ summary: "Resolve or dismiss a report" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_reports_dto_1.ResolveReportDto]),
    __metadata("design:returntype", Promise)
], AdminReportsController.prototype, "resolveReport", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Delete a report permanently" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminReportsController.prototype, "deleteReport", null);
exports.AdminReportsController = AdminReportsController = __decorate([
    (0, swagger_1.ApiTags)("Admin - Reports"),
    (0, common_1.Controller)("admin/reports"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [admin_reports_service_1.AdminReportsService])
], AdminReportsController);
//# sourceMappingURL=admin-reports.controller.js.map