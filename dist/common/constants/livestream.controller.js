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
const passport_1 = require("@nestjs/passport");
let LivestreamController = class LivestreamController {
    constructor(livestreamService) {
        this.livestreamService = livestreamService;
    }
    async startStream(req, title, description) {
        const userId = req.user['id'];
        const stream = await this.livestreamService.startStream(userId, title, description);
        return { message: 'Livestream started successfully', streamId: stream.id, roomName: stream.roomName };
    }
    async endStream(req, streamId) {
        const userId = req.user['id'];
        await this.livestreamService.endStream(streamId, userId);
        return { message: 'Livestream ended successfully' };
    }
    async getJoinToken(req, streamId) {
        const userId = req.user['id'];
        const username = req.user['username'];
        const token = await this.livestreamService.getJoinToken(streamId, userId, username);
        return { token, serverUrl: process.env.LIVEKIT_URL };
    }
    async getActiveStreams(page = 1, limit = 10, category) {
        return this.livestreamService.getActiveStreams(page, limit, category);
    }
};
exports.LivestreamController = LivestreamController;
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('start'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('title')),
    __param(2, (0, common_1.Body)('description')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], LivestreamController.prototype, "startStream", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('end/:streamId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('streamId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LivestreamController.prototype, "endStream", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('token/:streamId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('streamId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LivestreamController.prototype, "getJoinToken", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('active'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", Promise)
], LivestreamController.prototype, "getActiveStreams", null);
exports.LivestreamController = LivestreamController = __decorate([
    (0, common_1.Controller)('livestream'),
    __metadata("design:paramtypes", [livestream_service_1.LivestreamService])
], LivestreamController);
//# sourceMappingURL=livestream.controller.js.map