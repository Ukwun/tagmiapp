import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { BookingsService } from "./bookings.service"
import { BookingsController } from "./bookings.controller"
import { Booking } from "./entities/booking.entity"
import { BookingMessage } from "./entities/booking-message.entity"
import { BookingRepository } from "./repositories/booking.repository"
import { BookingMessageRepository } from "./repositories/booking-message.repository"

@Module({
  imports: [TypeOrmModule.forFeature([Booking, BookingMessage])],
  controllers: [BookingsController],
  providers: [BookingsService, BookingRepository, BookingMessageRepository],
  exports: [BookingsService, BookingRepository, BookingMessageRepository],
})
export class BookingsModule {}
