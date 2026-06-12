import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ThrottlerModule } from "@nestjs/throttler"
import { ScheduleModule } from "@nestjs/schedule"
import { AuthModule } from "./auth/auth.module"
import { UsersModule } from "./users/users.module"
import { ContentModule } from "./content/content.module"
import { BookingsModule } from "./bookings/bookings.module"
import { ChatModule } from "./chat/chat.module"
import { FollowsModule } from "./follows/follows.module"
import { NotificationsModule } from "./notifications/notifications.module"
import { BlocksModule } from "./blocks/blocks.module"
import { ReportsModule } from "./reports/reports.module"
import { AiModule } from "./ai/ai.module"
import { ReferralsModule } from "./referrals/referrals.module"
import { WalletModule } from "./wallet/wallet.module"
import { AdminModule } from "./admin/admin.module"
import { MusicModule } from "./music/music.module"
import { RedisModule } from "./config/redis.module"
import { CommonModule } from "./common/common.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST || "localhost",
      port: Number.parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || "postgres",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_DATABASE || "hashtag_db",
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== "production",
      // SSL configuration for remote databases (DigitalOcean, etc.)
      // DigitalOcean managed databases use self-signed certs, so we need rejectUnauthorized: false
      // This is ONLY for the database connection - other HTTPS calls still verify certificates
      // The connection is still encrypted (TLS), just not verifying the CA signature
      ...((process.env.DB_HOST && process.env.DB_HOST !== "localhost" && process.env.DB_HOST !== "127.0.0.1") && {
        ssl: { rejectUnauthorized: false },
      }),
    }),
    ScheduleModule.forRoot(),
    RedisModule,
    CommonModule,
    AuthModule,
    UsersModule,
    ContentModule,
    BookingsModule,
    ChatModule,
    FollowsModule,
    NotificationsModule,
    BlocksModule,
    ReportsModule,
    AiModule,
    ReferralsModule,
    WalletModule,
    AdminModule,
    MusicModule,
  ],
})
export class AppModule {}
