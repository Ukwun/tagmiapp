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
exports.EngagementSignal = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const content_entity_1 = require("./content.entity");
let EngagementSignal = class EngagementSignal {
};
exports.EngagementSignal = EngagementSignal;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], EngagementSignal.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)("uuid"),
    __metadata("design:type", String)
], EngagementSignal.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)("uuid"),
    __metadata("design:type", String)
], EngagementSignal.prototype, "contentId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EngagementSignal.prototype, "postId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: ["video", "audio", "image", "text"] }),
    __metadata("design:type", String)
], EngagementSignal.prototype, "contentType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "float", default: 0 }),
    __metadata("design:type", Number)
], EngagementSignal.prototype, "mediaProgress", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], EngagementSignal.prototype, "mediaCompleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], EngagementSignal.prototype, "dwellTimeMs", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "float", default: 0 }),
    __metadata("design:type", Number)
], EngagementSignal.prototype, "scrollDepth", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], EngagementSignal.prototype, "slideIndex", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 1 }),
    __metadata("design:type", Number)
], EngagementSignal.prototype, "totalSlides", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], EngagementSignal.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: "userId" }),
    __metadata("design:type", user_entity_1.User)
], EngagementSignal.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => content_entity_1.Content, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "contentId" }),
    __metadata("design:type", content_entity_1.Content)
], EngagementSignal.prototype, "content", void 0);
exports.EngagementSignal = EngagementSignal = __decorate([
    (0, typeorm_1.Entity)("engagement_signals"),
    (0, typeorm_1.Index)(["userId", "contentId"]),
    (0, typeorm_1.Index)(["postId"])
], EngagementSignal);
//# sourceMappingURL=engagement-signal.entity.js.map