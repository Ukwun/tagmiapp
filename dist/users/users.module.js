"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const users_controller_1 = require("./users.controller");
const users_service_1 = require("./users.service");
const user_entity_1 = require("./entities/user.entity");
const talent_profile_entity_1 = require("./entities/talent-profile.entity");
const client_profile_entity_1 = require("./entities/client-profile.entity");
const user_settings_entity_1 = require("./entities/user-settings.entity");
const storage_service_1 = require("../config/storage.service");
const referrals_module_1 = require("../referrals/referrals.module");
const follows_module_1 = require("../follows/follows.module");
const user_repository_1 = require("./repositories/user.repository");
const talent_profile_repository_1 = require("./repositories/talent-profile.repository");
const client_profile_repository_1 = require("./repositories/client-profile.repository");
const user_settings_repository_1 = require("./repositories/user-settings.repository");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, talent_profile_entity_1.TalentProfile, client_profile_entity_1.ClientProfile, user_settings_entity_1.UserSettings]),
            (0, common_1.forwardRef)(() => referrals_module_1.ReferralsModule),
            (0, common_1.forwardRef)(() => follows_module_1.FollowsModule),
        ],
        controllers: [users_controller_1.UsersController],
        providers: [
            users_service_1.UsersService,
            storage_service_1.StorageService,
            user_repository_1.UserRepository,
            talent_profile_repository_1.TalentProfileRepository,
            client_profile_repository_1.ClientProfileRepository,
            user_settings_repository_1.UserSettingsRepository,
        ],
        exports: [
            users_service_1.UsersService,
            user_repository_1.UserRepository,
            talent_profile_repository_1.TalentProfileRepository,
            client_profile_repository_1.ClientProfileRepository,
            user_settings_repository_1.UserSettingsRepository,
        ],
    })
], UsersModule);
//# sourceMappingURL=users.module.js.map