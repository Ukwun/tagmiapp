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
exports.ContentInteraction = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const content_entity_1 = require("./content.entity");
let ContentInteraction = class ContentInteraction {
};
exports.ContentInteraction = ContentInteraction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ContentInteraction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid" }),
    __metadata("design:type", String)
], ContentInteraction.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid" }),
    __metadata("design:type", String)
], ContentInteraction.prototype, "contentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "simple-enum", enum: ["like", "view", "share", "comment", "bookmark"] }),
    __metadata("design:type", String)
], ContentInteraction.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ContentInteraction.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: "userId" }),
    __metadata("design:type", user_entity_1.User)
], ContentInteraction.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => content_entity_1.Content, (content) => content.interactions, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "contentId" }),
    __metadata("design:type", content_entity_1.Content)
], ContentInteraction.prototype, "content", void 0);
exports.ContentInteraction = ContentInteraction = __decorate([
    (0, typeorm_1.Entity)("content_interactions")
], ContentInteraction);
//# sourceMappingURL=content-interaction.entity.js.map