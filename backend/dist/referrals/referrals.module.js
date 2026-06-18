"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferralsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const referral_entity_1 = require("./entities/referral.entity");
const referral_validation_entity_1 = require("./entities/referral-validation.entity");
const device_fingerprint_entity_1 = require("./entities/device-fingerprint.entity");
const fraud_flag_entity_1 = require("./entities/fraud-flag.entity");
const referrals_service_1 = require("./referrals.service");
const fraud_detection_service_1 = require("./services/fraud-detection.service");
const validation_pipeline_service_1 = require("./services/validation-pipeline.service");
const referrals_controller_1 = require("./referrals.controller");
const wallet_module_1 = require("../wallet/wallet.module");
const referral_repository_1 = require("./repositories/referral.repository");
const referral_validation_repository_1 = require("./repositories/referral-validation.repository");
const device_fingerprint_repository_1 = require("./repositories/device-fingerprint.repository");
const fraud_flag_repository_1 = require("./repositories/fraud-flag.repository");
const users_module_1 = require("../users/users.module");
const follows_module_1 = require("../follows/follows.module");
const content_module_1 = require("../content/content.module");
const auth_module_1 = require("../auth/auth.module");
let ReferralsModule = class ReferralsModule {
};
exports.ReferralsModule = ReferralsModule;
exports.ReferralsModule = ReferralsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                referral_entity_1.Referral,
                referral_validation_entity_1.ReferralValidation,
                device_fingerprint_entity_1.DeviceFingerprint,
                fraud_flag_entity_1.FraudFlag,
            ]),
            (0, common_1.forwardRef)(() => users_module_1.UsersModule),
            (0, common_1.forwardRef)(() => follows_module_1.FollowsModule),
            (0, common_1.forwardRef)(() => content_module_1.ContentModule),
            (0, common_1.forwardRef)(() => auth_module_1.AuthModule),
            (0, common_1.forwardRef)(() => wallet_module_1.WalletModule),
        ],
        controllers: [referrals_controller_1.ReferralsController],
        providers: [
            referrals_service_1.ReferralsService,
            fraud_detection_service_1.FraudDetectionService,
            validation_pipeline_service_1.ValidationPipelineService,
            referral_repository_1.ReferralRepository,
            referral_validation_repository_1.ReferralValidationRepository,
            device_fingerprint_repository_1.DeviceFingerprintRepository,
            fraud_flag_repository_1.FraudFlagRepository,
        ],
        exports: [
            referrals_service_1.ReferralsService,
            fraud_detection_service_1.FraudDetectionService,
            validation_pipeline_service_1.ValidationPipelineService,
            referral_repository_1.ReferralRepository,
            referral_validation_repository_1.ReferralValidationRepository,
            device_fingerprint_repository_1.DeviceFingerprintRepository,
            fraud_flag_repository_1.FraudFlagRepository,
        ],
    })
], ReferralsModule);
//# sourceMappingURL=referrals.module.js.map