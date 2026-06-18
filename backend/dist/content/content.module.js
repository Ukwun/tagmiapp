"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const crypto_1 = require("crypto");
const content_controller_1 = require("./content.controller");
const draft_controller_1 = require("./draft.controller");
const content_service_1 = require("./content.service");
const draft_service_1 = require("./draft.service");
const content_entity_1 = require("./entities/content.entity");
const draft_entity_1 = require("./entities/draft.entity");
const content_interaction_entity_1 = require("./entities/content-interaction.entity");
const comment_entity_1 = require("./entities/comment.entity");
const comment_like_entity_1 = require("./entities/comment-like.entity");
const mention_entity_1 = require("./entities/mention.entity");
const user_entity_1 = require("../users/entities/user.entity");
const engagement_signal_entity_1 = require("./entities/engagement-signal.entity");
const user_category_preference_entity_1 = require("./entities/user-category-preference.entity");
const content_repository_1 = require("./repositories/content.repository");
const content_interaction_repository_1 = require("./repositories/content-interaction.repository");
const comment_repository_1 = require("./repositories/comment.repository");
const comment_like_repository_1 = require("./repositories/comment-like.repository");
const mention_repository_1 = require("./repositories/mention.repository");
const engagement_signal_repository_1 = require("./repositories/engagement-signal.repository");
const draft_repository_1 = require("./repositories/draft.repository");
const user_repository_1 = require("../users/repositories/user.repository");
const user_preference_repository_1 = require("./repositories/user-preference.repository");
const user_preference_learning_service_1 = require("./user-preference-learning.service");
const personalized_feed_service_1 = require("./personalized-feed.service");
const storage_service_1 = require("../config/storage.service");
const redis_module_1 = require("../config/redis.module");
const notifications_module_1 = require("../notifications/notifications.module");
const referrals_module_1 = require("../referrals/referrals.module");
const follows_module_1 = require("../follows/follows.module");
const media_analysis_module_1 = require("../ai/media-analysis/media-analysis.module");
let ContentModule = class ContentModule {
};
exports.ContentModule = ContentModule;
exports.ContentModule = ContentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([content_entity_1.Content, content_interaction_entity_1.ContentInteraction, comment_entity_1.Comment, comment_like_entity_1.CommentLike, mention_entity_1.Mention, user_entity_1.User, engagement_signal_entity_1.EngagementSignal, draft_entity_1.Draft, user_category_preference_entity_1.UserCategoryPreference]),
            redis_module_1.RedisModule,
            (0, common_1.forwardRef)(() => notifications_module_1.NotificationsModule),
            (0, common_1.forwardRef)(() => referrals_module_1.ReferralsModule),
            (0, common_1.forwardRef)(() => follows_module_1.FollowsModule),
            media_analysis_module_1.MediaAnalysisModule,
            platform_express_1.MulterModule.register({
                storage: (0, multer_1.diskStorage)({
                    destination: os.tmpdir(),
                    filename: (_req, file, cb) => {
                        const ext = path.extname(file.originalname) || "";
                        cb(null, `upload-${(0, crypto_1.randomUUID)()}${ext}`);
                    },
                }),
                fileFilter: (req, file, callback) => {
                    callback(null, true);
                },
                limits: {
                    fileSize: 1024 * 1024 * 1024,
                },
            }),
        ],
        controllers: [draft_controller_1.DraftController, content_controller_1.ContentController],
        providers: [
            content_service_1.ContentService,
            draft_service_1.DraftService,
            storage_service_1.StorageService,
            content_repository_1.ContentRepository,
            content_interaction_repository_1.ContentInteractionRepository,
            comment_repository_1.CommentRepository,
            comment_like_repository_1.CommentLikeRepository,
            mention_repository_1.MentionRepository,
            engagement_signal_repository_1.EngagementSignalRepository,
            draft_repository_1.DraftRepository,
            user_repository_1.UserRepository,
            user_preference_repository_1.UserPreferenceRepository,
            user_preference_learning_service_1.UserPreferenceLearningService,
            personalized_feed_service_1.PersonalizedFeedService,
        ],
        exports: [
            content_service_1.ContentService,
            draft_service_1.DraftService,
            content_repository_1.ContentRepository,
            content_interaction_repository_1.ContentInteractionRepository,
            comment_repository_1.CommentRepository,
            comment_like_repository_1.CommentLikeRepository,
            mention_repository_1.MentionRepository,
            engagement_signal_repository_1.EngagementSignalRepository,
            draft_repository_1.DraftRepository,
            user_preference_repository_1.UserPreferenceRepository,
            user_preference_learning_service_1.UserPreferenceLearningService,
            personalized_feed_service_1.PersonalizedFeedService,
        ],
    })
], ContentModule);
//# sourceMappingURL=content.module.js.map