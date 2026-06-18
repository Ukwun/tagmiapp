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
exports.LivestreamController = void 0;
const common_1 = require("@nestjs/common");
const livestream_service_1 = require("./livestream.service");
class StreamStartDto {
}
class JoinStreamDto {
}
class JoinTokenDto {
}
let LivestreamController = class LivestreamController {
    constructor(livestreamService) {
        this.livestreamService = livestreamService;
    }
    async getActiveStreams() {
        return this.livestreamService.getActiveStreams();
    }
    async startStream(body) {
        const userId = body.userId?.trim() || `guest_${Date.now()}`;
        const username = body.username?.trim() || `Guest${Math.floor(Math.random() * 1000)}`;
        if (!body.title?.trim()) {
            throw new common_1.BadRequestException('A stream title is required.');
        }
        const stream = await this.livestreamService.startStream(userId, body.title.trim(), body.description?.trim());
        await this.livestreamService.joinStream(stream.id, userId);
        return { stream, roomId: stream.id };
    }
    async joinStream(streamId, body) {
        const userId = body.userId?.trim() || `guest_${Date.now()}`;
        await this.livestreamService.joinStream(streamId, userId);
        return { streamId, roomId: streamId };
    }
    async getJoinToken(streamId, body) {
        const userId = body.userId?.trim() || `guest_${Date.now()}`;
        const username = body.username?.trim() || `Guest${Math.floor(Math.random() * 1000)}`;
        const token = await this.livestreamService.getJoinToken(streamId, userId, username);
        return { token, roomId: streamId };
    }
};
exports.LivestreamController = LivestreamController;
__decorate([
    (0, common_1.Get)('active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LivestreamController.prototype, "getActiveStreams", null);
__decorate([
    (0, common_1.Post)('start'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [StreamStartDto]),
    __metadata("design:returntype", Promise)
], LivestreamController.prototype, "startStream", null);
__decorate([
    (0, common_1.Post)(':id/join'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, JoinStreamDto]),
    __metadata("design:returntype", Promise)
], LivestreamController.prototype, "joinStream", null);
__decorate([
    (0, common_1.Post)(':id/token'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, JoinTokenDto]),
    __metadata("design:returntype", Promise)
], LivestreamController.prototype, "getJoinToken", null);
exports.LivestreamController = LivestreamController = __decorate([
    (0, common_1.Controller)('livestreams'),
    __metadata("design:paramtypes", [livestream_service_1.LivestreamService])
], LivestreamController);
//# sourceMappingURL=livestream.controller.js.map