"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const otp_service_1 = require("./services/otp.service");
const user_entity_1 = require("../users/entities/user.entity");
const email_otp_entity_1 = require("./entities/email-otp.entity");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const local_strategy_1 = require("./strategies/local.strategy");
const referrals_module_1 = require("../referrals/referrals.module");
const user_repository_1 = require("../users/repositories/user.repository");
const otp_repository_1 = require("./repositories/otp.repository");
const email_module_1 = require("../email/email.module");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, email_otp_entity_1.EmailOtp]),
            passport_1.PassportModule,
            email_module_1.EmailModule,
            (0, common_1.forwardRef)(() => referrals_module_1.ReferralsModule),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get("JWT_SECRET") || "your-secret-key",
                    signOptions: { expiresIn: "7d" },
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [
            auth_service_1.AuthService,
            otp_service_1.OtpService,
            jwt_strategy_1.JwtStrategy,
            local_strategy_1.LocalStrategy,
            user_repository_1.UserRepository,
            otp_repository_1.OtpRepository,
        ],
        exports: [auth_service_1.AuthService, otp_service_1.OtpService, otp_repository_1.OtpRepository],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map