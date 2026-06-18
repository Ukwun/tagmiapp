"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LivestreamModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const livestream_service_1 = require("./livestream.service");
const livestream_gateway_1 = require("./livestream.gateway");
const livestream_controller_1 = require("./livestream.controller");
const livestream_entity_1 = require("./livestream.entity");
const livestream_participant_entity_1 = require("./livestream.participant.entity");
const livestream_file_entity_1 = require("./livestream.file.entity");
const user_entity_1 = require("../users/entities/user.entity");
const wallet_module_1 = require("../wallet/wallet.module");
let LivestreamModule = class LivestreamModule {
};
exports.LivestreamModule = LivestreamModule;
exports.LivestreamModule = LivestreamModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                livestream_entity_1.Livestream,
                livestream_participant_entity_1.LivestreamParticipant,
                livestream_file_entity_1.LivestreamFile,
                user_entity_1.User,
            ]),
            wallet_module_1.WalletModule,
        ],
        controllers: [livestream_controller_1.LivestreamController],
        providers: [livestream_service_1.LivestreamService, livestream_gateway_1.LivestreamGateway],
        exports: [livestream_service_1.LivestreamService],
    })
], LivestreamModule);
//# sourceMappingURL=livestream.module.js.map