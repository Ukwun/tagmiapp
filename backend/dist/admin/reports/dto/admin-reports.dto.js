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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolveReportDto = exports.ReportSearchQueryDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const pagination_dto_1 = require("../../dto/pagination.dto");
const report_entity_1 = require("../../../reports/entities/report.entity");
class ReportSearchQueryDto extends pagination_dto_1.PaginationQueryDto {
}
exports.ReportSearchQueryDto = ReportSearchQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: report_entity_1.ReportStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(report_entity_1.ReportStatus),
    __metadata("design:type", String)
], ReportSearchQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: report_entity_1.ReportType }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(report_entity_1.ReportType),
    __metadata("design:type", String)
], ReportSearchQueryDto.prototype, "type", void 0);
class ResolveReportDto {
}
exports.ResolveReportDto = ResolveReportDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: [report_entity_1.ReportStatus.RESOLVED, report_entity_1.ReportStatus.DISMISSED] }),
    (0, class_validator_1.IsEnum)([report_entity_1.ReportStatus.RESOLVED, report_entity_1.ReportStatus.DISMISSED]),
    __metadata("design:type", String)
], ResolveReportDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResolveReportDto.prototype, "adminNote", void 0);
//# sourceMappingURL=admin-reports.dto.js.map