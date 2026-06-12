"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const chat_gateway_1 = require("./chat.gateway");
const chat_service_1 = require("./chat.service");
const chat_controller_1 = require("./chat.controller");
const chat_room_entity_1 = require("./entities/chat-room.entity");
const chat_message_entity_1 = require("./entities/chat-message.entity");
const storage_service_1 = require("../config/storage.service");
const notifications_module_1 = require("../notifications/notifications.module");
const chat_room_repository_1 = require("./repositories/chat-room.repository");
const chat_message_repository_1 = require("./repositories/chat-message.repository");
const users_module_1 = require("../users/users.module");
const bookings_module_1 = require("../bookings/bookings.module");
let ChatModule = class ChatModule {
};
exports.ChatModule = ChatModule;
exports.ChatModule = ChatModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([chat_room_entity_1.ChatRoom, chat_message_entity_1.ChatMessage]),
            users_module_1.UsersModule,
            bookings_module_1.BookingsModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get("JWT_SECRET") || "your-secret-key",
                    signOptions: { expiresIn: "7d" },
                }),
                inject: [config_1.ConfigService],
            }),
            (0, common_1.forwardRef)(() => notifications_module_1.NotificationsModule),
        ],
        controllers: [chat_controller_1.ChatController],
        providers: [chat_gateway_1.ChatGateway, chat_service_1.ChatService, storage_service_1.StorageService, chat_room_repository_1.ChatRoomRepository, chat_message_repository_1.ChatMessageRepository],
        exports: [chat_service_1.ChatService, chat_room_repository_1.ChatRoomRepository, chat_message_repository_1.ChatMessageRepository],
    })
], ChatModule);
//# sourceMappingURL=chat.module.js.map