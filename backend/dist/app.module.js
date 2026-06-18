"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const throttler_1 = require("@nestjs/throttler");
const schedule_1 = require("@nestjs/schedule");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const content_module_1 = require("./content/content.module");
const follows_module_1 = require("./follows/follows.module");
const notifications_module_1 = require("./notifications/notifications.module");
const blocks_module_1 = require("./blocks/blocks.module");
const reports_module_1 = require("./reports/reports.module");
const ai_module_1 = require("./ai/ai.module");
const referrals_module_1 = require("./referrals/referrals.module");
const wallet_module_1 = require("./wallet/wallet.module");
const admin_module_1 = require("./admin/admin.module");
const music_module_1 = require("./music/music.module");
const livestream_module_1 = require("./livestream/livestream.module");
const redis_module_1 = require("./config/redis.module");
const common_module_1 = require("./common/common.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 10,
                },
            ]),
            typeorm_1.TypeOrmModule.forRoot({
                type: "postgres",
                host: process.env.DB_HOST || "localhost",
                port: Number.parseInt(process.env.DB_PORT || "5432"),
                username: process.env.DB_USERNAME || "postgres",
                password: process.env.DB_PASSWORD || "",
                database: process.env.DB_DATABASE || "hashtag_db",
                autoLoadEntities: true,
                synchronize: false,
                migrations: ["dist/**/migrations/*.js"],
                migrationsRun: true,
                ...((process.env.DB_HOST &&
                    process.env.DB_HOST !== "localhost" &&
                    process.env.DB_HOST !== "127.0.0.1") && {
                    ssl: { rejectUnauthorized: false },
                }),
            }),
            schedule_1.ScheduleModule.forRoot(),
            redis_module_1.RedisModule,
            common_module_1.CommonModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            content_module_1.ContentModule,
            follows_module_1.FollowsModule,
            notifications_module_1.NotificationsModule,
            blocks_module_1.BlocksModule,
            reports_module_1.ReportsModule,
            ai_module_1.AiModule,
            referrals_module_1.ReferralsModule,
            wallet_module_1.WalletModule,
            admin_module_1.AdminModule,
            music_module_1.MusicModule,
            livestream_module_1.LivestreamModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map