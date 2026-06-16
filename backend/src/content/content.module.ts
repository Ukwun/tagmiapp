import { Module, forwardRef } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { MulterModule } from "@nestjs/platform-express"
import { diskStorage } from "multer"
import * as os from "os"
import * as path from "path"
import { randomUUID } from "crypto"
import { ContentController } from "./content.controller"
import { DraftController } from "./draft.controller"
import { ContentService } from "./content.service"
import { DraftService } from "./draft.service"
import { Content } from "./entities/content.entity"
import { Draft } from "./entities/draft.entity"
import { ContentInteraction } from "./entities/content-interaction.entity"
import { Comment } from "./entities/comment.entity"
import { CommentLike } from "./entities/comment-like.entity"
import { Mention } from "./entities/mention.entity"
import { User } from "../users/entities/user.entity"
import { EngagementSignal } from "./entities/engagement-signal.entity"
import { UserCategoryPreference } from "./entities/user-category-preference.entity"
import { ContentRepository } from "./repositories/content.repository"
import { ContentInteractionRepository } from "./repositories/content-interaction.repository"
import { CommentRepository } from "./repositories/comment.repository"
import { CommentLikeRepository } from "./repositories/comment-like.repository"
import { MentionRepository } from "./repositories/mention.repository"
import { EngagementSignalRepository } from "./repositories/engagement-signal.repository"
import { DraftRepository } from "./repositories/draft.repository"
import { UserRepository } from "../users/repositories/user.repository"
import { UserPreferenceRepository } from "./repositories/user-preference.repository"
import { UserPreferenceLearningService } from "./user-preference-learning.service"
import { PersonalizedFeedService } from "./personalized-feed.service"
import { StorageService } from "../config/storage.service"
import { RedisModule } from "../config/redis.module"
import { NotificationsModule } from "../notifications/notifications.module"
import { ReferralsModule } from "../referrals/referrals.module"
import { FollowsModule } from "../follows/follows.module"
import { MediaAnalysisModule } from "../ai/media-analysis/media-analysis.module"

@Module({
  imports: [
    TypeOrmModule.forFeature([Content, ContentInteraction, Comment, CommentLike, Mention, User, EngagementSignal, Draft, UserCategoryPreference]),
    RedisModule,
    forwardRef(() => NotificationsModule),
    forwardRef(() => ReferralsModule),
    forwardRef(() => FollowsModule),
    MediaAnalysisModule,
    MulterModule.register({
      storage: diskStorage({
        destination: os.tmpdir(),
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname) || ""
          cb(null, `upload-${randomUUID()}${ext}`)
        },
      }),
      fileFilter: (req, file, callback) => {
        // Accept all files — iOS sometimes sends empty MIME types
        callback(null, true)
      },
      limits: {
        fileSize: 1024 * 1024 * 1024, // 1GB
      },
    }),
  ],
  controllers: [DraftController, ContentController],
  providers: [
    ContentService,
    DraftService,
    StorageService,
    ContentRepository,
    ContentInteractionRepository,
    CommentRepository,
    CommentLikeRepository,
    MentionRepository,
    EngagementSignalRepository,
    DraftRepository,
    UserRepository,
    UserPreferenceRepository,
    UserPreferenceLearningService,
    PersonalizedFeedService,
  ],
  exports: [
    ContentService,
    DraftService,
    ContentRepository,
    ContentInteractionRepository,
    CommentRepository,
    CommentLikeRepository,
    MentionRepository,
    EngagementSignalRepository,
    DraftRepository,
    UserPreferenceRepository,
    UserPreferenceLearningService,
    PersonalizedFeedService,
  ],
})
export class ContentModule {}
