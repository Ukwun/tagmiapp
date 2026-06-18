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
exports.UserCategoryPreference = void 0;
const typeorm_1 = require("typeorm");
let UserCategoryPreference = class UserCategoryPreference {
};
exports.UserCategoryPreference = UserCategoryPreference;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserCategoryPreference.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "user_id", type: "uuid" }),
    __metadata("design:type", String)
], UserCategoryPreference.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], UserCategoryPreference.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "decimal",
        precision: 4,
        scale: 3,
        default: 0.5,
        name: "affinity_score",
    }),
    __metadata("design:type", Number)
], UserCategoryPreference.prototype, "affinityScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0, name: "engagement_count" }),
    __metadata("design:type", Number)
], UserCategoryPreference.prototype, "engagementCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "datetime", nullable: true, name: "last_engagement_at" }),
    __metadata("design:type", Date)
], UserCategoryPreference.prototype, "lastEngagementAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], UserCategoryPreference.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], UserCategoryPreference.prototype, "updatedAt", void 0);
exports.UserCategoryPreference = UserCategoryPreference = __decorate([
    (0, typeorm_1.Entity)("user_category_preference"),
    (0, typeorm_1.Unique)(["userId", "category"]),
    (0, typeorm_1.Index)(["userId"]),
    (0, typeorm_1.Index)(["affinityScore"])
], UserCategoryPreference);
//# sourceMappingURL=user-category-preference.entity.js.map