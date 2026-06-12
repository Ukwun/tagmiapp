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
exports.SessionTrackingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_session_entity_1 = require("../entities/user-session.entity");
let SessionTrackingService = class SessionTrackingService {
    constructor(sessionRepository) {
        this.sessionRepository = sessionRepository;
    }
    async startSession(userId, ip, deviceFingerprintHash) {
        const session = this.sessionRepository.create({
            userId,
            ip,
            deviceFingerprintHash,
            startedAt: new Date(),
        });
        return this.sessionRepository.save(session);
    }
    async heartbeat(sessionId, userId) {
        const session = await this.sessionRepository.findOne({
            where: { id: sessionId, userId },
        });
        if (!session) {
            return this.startSession(userId);
        }
        const now = new Date();
        session.endedAt = now;
        session.durationSeconds = Math.floor((now.getTime() - session.startedAt.getTime()) / 1000);
        return this.sessionRepository.save(session);
    }
    async endSession(sessionId, userId) {
        const session = await this.sessionRepository.findOne({
            where: { id: sessionId, userId },
        });
        if (session) {
            const now = new Date();
            session.endedAt = now;
            session.durationSeconds = Math.floor((now.getTime() - session.startedAt.getTime()) / 1000);
            await this.sessionRepository.save(session);
        }
    }
    async getSessionStats(userId) {
        const sessions = await this.sessionRepository.find({
            where: { userId },
            order: { startedAt: "ASC" },
        });
        const uniqueDays = new Set(sessions.map((s) => {
            const d = new Date(s.startedAt);
            return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        })).size;
        const totalSeconds = sessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
        return {
            uniqueDays,
            totalSeconds,
            sessionCount: sessions.length,
        };
    }
};
exports.SessionTrackingService = SessionTrackingService;
exports.SessionTrackingService = SessionTrackingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_session_entity_1.UserSession)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SessionTrackingService);
//# sourceMappingURL=session-tracking.service.js.map