import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LivestreamService } from './livestream.service';
import { LivestreamGateway } from './livestream.gateway';
import { LivestreamController } from './livestream.controller';
import { Livestream } from './entities/livestream.entity';
import { LivestreamParticipant } from './entities/livestream-participant.entity';
import { LivestreamFile } from './entities/livestream-file.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Livestream,
      LivestreamParticipant,
      LivestreamFile,
      User,
    ]),
  ],
  controllers: [LivestreamController],
  providers: [LivestreamService, LivestreamGateway],
  exports: [LivestreamService],
})
export class LivestreamModule {}