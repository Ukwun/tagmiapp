import { Module, forwardRef } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { JwtModule } from "@nestjs/jwt"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { ChatGateway } from "./chat.gateway"
import { ChatService } from "./chat.service"
import { ChatController } from "./chat.controller"
import { ChatRoom } from "./entities/chat-room.entity"
import { ChatMessage } from "./entities/chat-message.entity"
import { StorageService } from "../config/storage.service"
import { NotificationsModule } from "../notifications/notifications.module"
import { ChatRoomRepository } from "./repositories/chat-room.repository"
import { ChatMessageRepository } from "./repositories/chat-message.repository"
import { UsersModule } from "../users/users.module"
import { BookingsModule } from "../bookings/bookings.module"

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatRoom, ChatMessage]),
    UsersModule,
    BookingsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET") || "your-secret-key",
        signOptions: { expiresIn: "7d" },
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => NotificationsModule),
  ],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService, StorageService, ChatRoomRepository, ChatMessageRepository],
  exports: [ChatService, ChatRoomRepository, ChatMessageRepository],
})
export class ChatModule {}
