import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ThrottlerModule } from "@nestjs/throttler"
import { ScheduleModule } from "@nestjs/schedule"
import { AuthModule } from "./auth/auth.module"
import { UsersModule } from "./users/users.module"
import { ContentModule } from "./content/content.module"
import { FollowsModule } from "./follows/follows.module"
import { NotificationsModule } from "./notifications/notifications.module"
import { BlocksModule } from "./blocks/blocks.module"
import { ReportsModule } from "./reports/reports.module"
import { AiModule } from "./ai/ai.module"
import { ReferralsModule } from "./referrals/referrals.module"
import { WalletModule } from "./wallet/wallet.module"
import { AdminModule } from "./admin/admin.module"
import { MusicModule } from "./music/music.module"
import { LivestreamModule } from "./livestream/livestream.module"
import { RedisModule } from "./config/redis.module"
import { CommonModule } from "./common/common.module"

const getDatabaseConfig = () => {
  const databaseUrl = process.env.DATABASE_URL || process.env.DB_URL
  const host = process.env.DB_HOST
  const port = Number.parseInt(process.env.DB_PORT || "5432")
  const username = process.env.DB_USERNAME || "postgres"
  const password = process.env.DB_PASSWORD || ""
  const database = process.env.DB_DATABASE || "hashtag_db"

  if (databaseUrl || host) {
    return {
      type: "postgres" as const,
      ...(databaseUrl
        ? { url: databaseUrl }
        : {
            host,
            port,
            username,
            password,
            database,
          }),
      autoLoadEntities: true,
      synchronize: false,
      migrations: ["dist/**/migrations/*.js"],
      migrationsRun: true,
      ...((host && host !== "localhost" && host !== "127.0.0.1") && {
        ssl: { rejectUnauthorized: false },
      }),
    }
  }

  console.warn(
    "No database environment variables found. Falling back to SQLite for deployment."
  )

  return {
    type: "sqlite" as const,
    database: process.env.SQLITE_DB_PATH || "data/sqlite.db",
    autoLoadEntities: true,
    synchronize: true,
    migrations: ["dist/**/migrations/*.js"],
    migrationsRun: false,
  }
}

@Module({
imports: [
ConfigModule.forRoot({
isGlobal: true,
}),
ThrottlerModule.forRoot([
{
ttl: 60000,
limit: 10,
},
]),
TypeOrmModule.forRoot(getDatabaseConfig()),
ScheduleModule.forRoot(),
RedisModule,
CommonModule,
AuthModule,
UsersModule,
ContentModule,
FollowsModule,
NotificationsModule,
BlocksModule,
ReportsModule,
AiModule,
ReferralsModule,
WalletModule,
AdminModule,
MusicModule,
LivestreamModule,
],
})
export class AppModule {}