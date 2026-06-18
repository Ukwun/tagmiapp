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
exports.CreatePostDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreatePostDto {
}
exports.CreatePostDto = CreatePostDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Caption for the post", maxLength: 2200, required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(2200),
    __metadata("design:type", String)
], CreatePostDto.prototype, "caption", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Array of hashtags", type: [String], required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreatePostDto.prototype, "hashtags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Background music URL", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePostDto.prototype, "backgroundMusicUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Slide types array", type: Object, required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreatePostDto.prototype, "slideTypes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Slide texts for text-only slides", type: Object, required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreatePostDto.prototype, "slideTexts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Slide background colors", type: Object, required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreatePostDto.prototype, "slideBackgrounds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Slide font styles", type: Object, required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreatePostDto.prototype, "slideFontStyles", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Per-slide captions", type: Object, required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreatePostDto.prototype, "slideCaptions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Per-slide music file index mapping", type: Object, required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreatePostDto.prototype, "slideMusicIndex", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Per-slide music trim start (seconds)", type: Object, required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreatePostDto.prototype, "slideMusicTrimStart", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Per-slide music trim end (seconds)", type: Object, required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreatePostDto.prototype, "slideMusicTrimEnd", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Per-slide video trim start (seconds)", type: Object, required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreatePostDto.prototype, "videoTrimStart", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Per-slide video trim end (seconds)", type: Object, required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreatePostDto.prototype, "videoTrimEnd", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Per-slide custom thumbnail file index mapping", type: Object, required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreatePostDto.prototype, "slideThumbnailIndex", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Schedule post for future time (ISO 8601)", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePostDto.prototype, "scheduledAt", void 0);
//# sourceMappingURL=create-post.dto.js.map