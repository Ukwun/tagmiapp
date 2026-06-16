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
exports.MusicController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const music_service_1 = require("./music.service");
let MusicController = class MusicController {
    constructor(musicService) {
        this.musicService = musicService;
    }
    async search(query, limit) {
        return this.musicService.search(query || "", parseInt(limit || "20", 10));
    }
    async trending(limit) {
        return this.musicService.getTrending(parseInt(limit || "20", 10));
    }
};
exports.MusicController = MusicController;
__decorate([
    (0, common_1.Get)("search"),
    __param(0, (0, common_1.Query)("q")),
    __param(1, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MusicController.prototype, "search", null);
__decorate([
    (0, common_1.Get)("trending"),
    __param(0, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MusicController.prototype, "trending", null);
exports.MusicController = MusicController = __decorate([
    (0, common_1.Controller)("music"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [music_service_1.MusicService])
], MusicController);
//# sourceMappingURL=music.controller.js.map