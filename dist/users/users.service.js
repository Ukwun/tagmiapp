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
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const storage_service_1 = require("../config/storage.service");
const validation_pipeline_service_1 = require("../referrals/services/validation-pipeline.service");
const error_handler_1 = require("../common/exceptions/error.handler");
const error_messages_constant_1 = require("../common/constants/error-messages.constant");
const user_repository_1 = require("./repositories/user.repository");
const talent_profile_repository_1 = require("./repositories/talent-profile.repository");
const client_profile_repository_1 = require("./repositories/client-profile.repository");
const user_settings_repository_1 = require("./repositories/user-settings.repository");
const follow_repository_1 = require("../follows/repositories/follow.repository");
let UsersService = UsersService_1 = class UsersService {
    constructor(userRepository, talentProfileRepository, clientProfileRepository, settingsRepository, followRepository, storageService, validationPipelineService) {
        this.userRepository = userRepository;
        this.talentProfileRepository = talentProfileRepository;
        this.clientProfileRepository = clientProfileRepository;
        this.settingsRepository = settingsRepository;
        this.followRepository = followRepository;
        this.storageService = storageService;
        this.validationPipelineService = validationPipelineService;
        this.logger = new common_1.Logger(UsersService_1.name);
    }
    async triggerReferralValidation(userId) {
        if (!this.validationPipelineService)
            return;
        try {
            const referral = await this.validationPipelineService.getActiveReferralForUser(userId);
            if (referral) {
                await this.validationPipelineService.runValidation(referral.id);
            }
        }
        catch (error) {
            this.logger.warn(`Failed to trigger referral validation for user ${userId}: ${error.message}`);
        }
    }
    async findById(id) {
        return this.userRepository.findById(id);
    }
    async findByUsername(username) {
        return this.userRepository.findByUsername(username);
    }
    async findByIdOrUsername(idOrUsername) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrUsername);
        return isUuid ? this.findById(idOrUsername) : this.findByUsername(idOrUsername);
    }
    async updateProfile(userId, updateUserDto) {
        const user = await this.findById(userId);
        Object.assign(user, updateUserDto);
        const savedUser = await this.userRepository.save(user);
        await this.triggerReferralValidation(userId);
        return savedUser;
    }
    async uploadAvatar(userId, file) {
        if (!file) {
            error_handler_1.ErrorHandler.badRequest(error_messages_constant_1.ERROR_MESSAGES.FILE_UPLOAD_FAILED);
        }
        if (!file.mimetype.startsWith("image/")) {
            error_handler_1.ErrorHandler.badRequest(error_messages_constant_1.ERROR_MESSAGES.INVALID_FILE_TYPE);
        }
        const user = await this.findById(userId);
        const uploadResult = await this.storageService.uploadImage(file, "avatars");
        user.avatarUrl = uploadResult.secure_url;
        await this.userRepository.save(user);
        await this.triggerReferralValidation(userId);
        return { avatarUrl: uploadResult.secure_url };
    }
    async uploadCover(userId, file) {
        if (!file) {
            error_handler_1.ErrorHandler.badRequest(error_messages_constant_1.ERROR_MESSAGES.FILE_UPLOAD_FAILED);
        }
        if (!file.mimetype.startsWith("image/")) {
            error_handler_1.ErrorHandler.badRequest(error_messages_constant_1.ERROR_MESSAGES.INVALID_FILE_TYPE);
        }
        const user = await this.findById(userId);
        const uploadResult = await this.storageService.uploadImage(file, "covers");
        user.coverImageUrl = uploadResult.secure_url;
        await this.userRepository.save(user);
        return { coverImageUrl: uploadResult.secure_url };
    }
    async updateTalentProfile(userId, updateTalentProfileDto) {
        await this.findById(userId);
        let talentProfile = await this.talentProfileRepository.findByUserIdOptional(userId);
        if (!talentProfile) {
            return this.talentProfileRepository.create({
                userId,
                ...updateTalentProfileDto,
            });
        }
        else {
            Object.assign(talentProfile, updateTalentProfileDto);
            return this.talentProfileRepository.save(talentProfile);
        }
    }
    async getTalentProfile(userId) {
        return this.talentProfileRepository.findByUserId(userId);
    }
    async getSuggestedUsers(currentUserId, limit = 5) {
        const followedIds = await this.followRepository
            .createQueryBuilder("follow")
            .select("follow.followingId")
            .where("follow.followerId = :currentUserId", { currentUserId })
            .getMany();
        const excludeIds = [currentUserId, ...followedIds.map((f) => f.followingId)];
        const users = await this.userRepository.findSuggestedUsers(excludeIds, limit);
        return users.map((user) => ({
            ...user,
            isFollowing: false,
        }));
    }
    async searchUsers(query, limit = 10, currentUserId) {
        const users = await this.userRepository.searchUsers(query, limit);
        if (currentUserId && users.length > 0) {
            const follows = await this.followRepository.find({
                where: { followerId: currentUserId },
                select: ["followingId"],
            });
            const followingIds = new Set(follows.map((f) => f.followingId));
            return users.map((user) => ({
                ...user,
                isFollowing: followingIds.has(user.id),
            }));
        }
        return users.map((user) => ({
            ...user,
            isFollowing: false,
        }));
    }
    async getOrCreateSettings(userId) {
        let settings = await this.settingsRepository.findByUserIdOptional(userId);
        if (!settings) {
            settings = await this.settingsRepository.create(userId);
        }
        return settings;
    }
    async updateSettings(userId, dto) {
        let settings = await this.settingsRepository.findByUserIdOptional(userId);
        if (!settings) {
            settings = await this.settingsRepository.create(userId);
        }
        Object.assign(settings, dto);
        return this.settingsRepository.save(settings);
    }
    async deleteAccount(userId) {
        const user = await this.findById(userId);
        const ts = Date.now();
        user.isActive = false;
        user.email = `deleted_${ts}@deleted.tagmi`;
        user.username = `deleted_${ts}`;
        user.displayName = "Deleted User";
        user.avatarUrl = null;
        user.coverImageUrl = null;
        user.bio = null;
        await this.userRepository.save(user);
    }
    async searchTalents(query, skills, categories, page = 1, limit = 20, excludeUserId) {
        const [talentProfiles, total] = await this.talentProfileRepository.searchTalents(query, skills, categories, page, limit, excludeUserId);
        let followingIds = new Set();
        if (excludeUserId && talentProfiles.length > 0) {
            const follows = await this.followRepository.find({
                where: { followerId: excludeUserId },
                select: ["followingId"],
            });
            followingIds = new Set(follows.map((f) => f.followingId));
        }
        const data = talentProfiles.map((profile) => ({
            ...profile.user,
            talentProfile: profile,
            isFollowing: followingIds.has(profile.user.id),
        }));
        return {
            data,
            total,
            page,
            limit,
            hasNext: page * limit < total,
            hasPrev: page > 1,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(6, (0, common_1.Optional)()),
    __param(6, (0, common_1.Inject)((0, common_1.forwardRef)(() => validation_pipeline_service_1.ValidationPipelineService))),
    __metadata("design:paramtypes", [user_repository_1.UserRepository,
        talent_profile_repository_1.TalentProfileRepository,
        client_profile_repository_1.ClientProfileRepository,
        user_settings_repository_1.UserSettingsRepository,
        follow_repository_1.FollowRepository,
        storage_service_1.StorageService,
        validation_pipeline_service_1.ValidationPipelineService])
], UsersService);
//# sourceMappingURL=users.service.js.map