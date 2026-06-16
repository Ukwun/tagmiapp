import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LivestreamService } from './livestream.service';
import { LivestreamGateway } from './livestream.gateway';
import { LivestreamController } from './livestream.controller';
import { Livestream } from './livestream.entity';
import { LivestreamParticipant } from './livestream.participant.entity';
import { LivestreamFile } from './livestream.file.entity';
import { User } from '../users/entities/user.entity';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Livestream,
      LivestreamParticipant,
      LivestreamFile,
      User,
    ]),
    WalletModule,
  ],
  controllers: [LivestreamController],
  providers: [LivestreamService, LivestreamGateway],
  exports: [LivestreamService],
})
export class LivestreamModule {}