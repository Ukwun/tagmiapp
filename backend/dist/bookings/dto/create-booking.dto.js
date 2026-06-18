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
exports.CreateBookingDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateBookingDto {
}
exports.CreateBookingDto = CreateBookingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "ID of the talent to book" }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "talentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Title of the booking" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Detailed description of the work needed" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Budget for the project" }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateBookingDto.prototype, "budget", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Start date of the project" }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], CreateBookingDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "End date of the project", required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], CreateBookingDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "List of requirements", required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateBookingDto.prototype, "requirements", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "List of expected deliverables", required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateBookingDto.prototype, "deliverables", void 0);
//# sourceMappingURL=create-booking.dto.js.map