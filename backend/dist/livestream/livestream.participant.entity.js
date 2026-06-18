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
exports.LivestreamParticipant = exports.LivestreamRole = void 0;
const typeorm_1 = require("typeorm");
const livestream_entity_1 = require("./livestream.entity");
const user_entity_1 = require("../users/entities/user.entity");
var LivestreamRole;
(function (LivestreamRole) {
    LivestreamRole["HOST"] = "HOST";
    LivestreamRole["PRESENTER"] = "PRESENTER";
    LivestreamRole["PARTICIPANT"] = "PARTICIPANT";
})(LivestreamRole || (exports.LivestreamRole = LivestreamRole = {}));
let LivestreamParticipant = class LivestreamParticipant {
};
exports.LivestreamParticipant = LivestreamParticipant;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], LivestreamParticipant.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LivestreamParticipant.prototype, "livestreamId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LivestreamParticipant.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: LivestreamRole,
        default: LivestreamRole.PARTICIPANT,
    }),
    __metadata("design:type", String)
], LivestreamParticipant.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LivestreamParticipant.prototype, "joinedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "timestamp" }),
    __metadata("design:type", Date)
], LivestreamParticipant.prototype, "leftAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" }),
    __metadata("design:type", Date)
], LivestreamParticipant.prototype, "lastActiveAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => livestream_entity_1.Livestream, (l) => l.participants),
    (0, typeorm_1.JoinColumn)({ name: "livestreamId" }),
    __metadata("design:type", livestream_entity_1.Livestream)
], LivestreamParticipant.prototype, "livestream", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: "userId" }),
    __metadata("design:type", user_entity_1.User)
], LivestreamParticipant.prototype, "user", void 0);
exports.LivestreamParticipant = LivestreamParticipant = __decorate([
    (0, typeorm_1.Entity)("livestream_participants")
], LivestreamParticipant);
//# sourceMappingURL=livestream.participant.entity.js.map