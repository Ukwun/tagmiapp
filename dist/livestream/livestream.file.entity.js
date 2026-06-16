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
exports.LivestreamFile = void 0;
const typeorm_1 = require("typeorm");
const livestream_entity_1 = require("./livestream.entity");
const user_entity_1 = require("../users/entities/user.entity");
let LivestreamFile = class LivestreamFile {
};
exports.LivestreamFile = LivestreamFile;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], LivestreamFile.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LivestreamFile.prototype, "livestreamId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LivestreamFile.prototype, "uploadedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LivestreamFile.prototype, "fileUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LivestreamFile.prototype, "fileName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LivestreamFile.prototype, "fileType", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LivestreamFile.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => livestream_entity_1.Livestream, (l) => l.files),
    (0, typeorm_1.JoinColumn)({ name: "livestreamId" }),
    __metadata("design:type", livestream_entity_1.Livestream)
], LivestreamFile.prototype, "livestream", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: "uploadedBy" }),
    __metadata("design:type", user_entity_1.User)
], LivestreamFile.prototype, "user", void 0);
exports.LivestreamFile = LivestreamFile = __decorate([
    (0, typeorm_1.Entity)("livestream_files")
], LivestreamFile);
//# sourceMappingURL=livestream.file.entity.js.map