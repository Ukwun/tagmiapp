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
exports.LivestreamService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const livestream_entity_1 = require("./livestream.entity");
const livestream_participant_entity_1 = require("./livestream.participant.entity");
const livestream_file_entity_1 = require("./livestream.file.entity");
const error_messages_constant_1 = require("../common/constants/error-messages.constant");
const authorization_helper_1 = require("../common/guards/authorization.helper");
const livekit_server_sdk_1 = require("livekit-server-sdk");
let LivestreamService = class LivestreamService {
    constructor(livestreamRepository, participantRepository, fileRepository) {
        this.livestreamRepository = livestreamRepository;
        this.participantRepository = participantRepository;
        this.fileRepository = fileRepository;
    }
    async validateStreamSafety(title, description) {
        const forbiddenKeywords = ['spam', 'scam', 'offensive_term'];
        const combinedText = `${title} ${description || ''}`.toLowerCase();
        for (const word of forbiddenKeywords) {
            if (combinedText.includes(word)) {
                throw new common_1.BadRequestException('Stream title or description contains inappropriate content.');
            }
        }
    }
    async startStream(userId, title, description) {
        await this.validateStreamSafety(title, description);
        const activeStream = await this.livestreamRepository.findOne({
            where: { hostId: userId, status: 'live' },
        });
        if (activeStream) {
            throw new common_1.BadRequestException(error_messages_constant_1.ERROR_MESSAGES.LIVESTREAM_ALREADY_ACTIVE);
        }
        const stream = this.livestreamRepository.create({
            hostId: userId,
            title,
            description,
            status: 'live',
            roomName: `room_${userId}_${Date.now()}`,
            startedAt: new Date(),
        });
        const savedStream = await this.livestreamRepository.save(stream);
        await this.participantRepository.save({
            livestreamId: savedStream.id,
            userId,
            role: livestream_participant_entity_1.LivestreamRole.HOST,
        });
        return savedStream;
    }
    async joinStream(streamId, userId) {
        const stream = await this.livestreamRepository.findOne({ where: { id: streamId } });
        if (!stream || stream.status !== 'live') {
            throw new common_1.BadRequestException(error_messages_constant_1.ERROR_MESSAGES.LIVESTREAM_NOT_FOUND);
        }
        const existing = await this.participantRepository.findOne({
            where: { livestreamId: streamId, userId }
        });
        if (existing) {
            return existing;
        }
        return this.participantRepository.save(this.participantRepository.create({
            livestreamId: streamId,
            userId,
            role: livestream_participant_entity_1.LivestreamRole.PARTICIPANT,
        }));
    }
    async updateHeartbeat(streamId, userId) {
        await this.participantRepository.update({ livestreamId: streamId, userId }, { lastActiveAt: new Date() });
    }
    async shareFile(streamId, userId, fileUrl, fileType) {
        const stream = await this.livestreamRepository.findOne({ where: { id: streamId } });
        if (!stream || stream.status !== 'live') {
            throw new common_1.BadRequestException(error_messages_constant_1.ERROR_MESSAGES.LIVESTREAM_NOT_FOUND);
        }
        const file = this.fileRepository.create({ livestreamId: streamId, uploadedBy: userId, fileUrl, fileType });
        return this.fileRepository.save(file);
    }
    async getJoinToken(streamId, userId, username) {
        const stream = await this.livestreamRepository.findOne({ where: { id: streamId } });
        if (!stream) {
            throw new common_1.BadRequestException(error_messages_constant_1.ERROR_MESSAGES.LIVESTREAM_NOT_FOUND);
        }
        const at = new livekit_server_sdk_1.AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, { identity: userId, name: username });
        at.addGrant({
            roomJoin: true,
            room: stream.roomName,
            canPublish: stream.hostId === userId,
            canSubscribe: true,
        });
        return at.toJwt();
    }
    async getActiveStreams() {
        const streams = await this.livestreamRepository.find({ where: { status: 'live' } });
        return Promise.all(streams.map(async (stream) => {
            const viewers = await this.participantRepository.count({ where: { livestreamId: stream.id } });
            return {
                ...stream,
                viewers,
            };
        }));
    }
    async toggleScreenShare(streamId, userId, isSharing, presentationUrl) {
        const stream = await this.livestreamRepository.findOne({ where: { id: streamId } });
        if (!stream) {
            throw new common_1.BadRequestException(error_messages_constant_1.ERROR_MESSAGES.LIVESTREAM_NOT_FOUND);
        }
        authorization_helper_1.AuthorizationHelper.verifyOwnership(stream.hostId, userId, error_messages_constant_1.ERROR_MESSAGES.NOT_THE_HOST);
        stream.isScreenSharing = isSharing;
        stream.activePresentationUrl = presentationUrl || null;
        return this.livestreamRepository.save(stream);
    }
    async updatePdfPage(streamId, userId, page) {
        const stream = await this.livestreamRepository.findOne({ where: { id: streamId } });
        if (!stream) {
            throw new common_1.BadRequestException(error_messages_constant_1.ERROR_MESSAGES.LIVESTREAM_NOT_FOUND);
        }
        authorization_helper_1.AuthorizationHelper.verifyOwnership(stream.hostId, userId, error_messages_constant_1.ERROR_MESSAGES.NOT_THE_HOST);
        await this.livestreamRepository.update(streamId, { currentPdfPage: page });
        stream.currentPdfPage = page;
        return this.livestreamRepository.save(stream);
    }
};
exports.LivestreamService = LivestreamService;
exports.LivestreamService = LivestreamService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(livestream_entity_1.Livestream)),
    __param(1, (0, typeorm_1.InjectRepository)(livestream_participant_entity_1.LivestreamParticipant)),
    __param(2, (0, typeorm_1.InjectRepository)(livestream_file_entity_1.LivestreamFile)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], LivestreamService);
//# sourceMappingURL=livestream.service.js.map