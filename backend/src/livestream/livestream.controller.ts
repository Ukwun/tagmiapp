import { Body, Controller, Get, Param, Post, BadRequestException } from '@nestjs/common';
import { LivestreamService } from './livestream.service';
import { Livestream } from './livestream.entity';

class StreamStartDto {
  title: string;
  description?: string;
  userId?: string;
  username?: string;
}

class JoinStreamDto {
  userId?: string;
  username?: string;
}

class JoinTokenDto {
  userId?: string;
  username?: string;
}

@Controller('livestreams')
export class LivestreamController {
  constructor(private readonly livestreamService: LivestreamService) {}

  @Get('active')
  async getActiveStreams(): Promise<Array<Livestream & { viewers: number }>> {
    return this.livestreamService.getActiveStreams();
  }

  @Post('start')
  async startStream(@Body() body: StreamStartDto): Promise<{ stream: Livestream; roomId: string }> {
    const userId = body.userId?.trim() || `guest_${Date.now()}`;
    const username = body.username?.trim() || `Guest${Math.floor(Math.random() * 1000)}`;

    if (!body.title?.trim()) {
      throw new BadRequestException('A stream title is required.');
    }

    const stream = await this.livestreamService.startStream(userId, body.title.trim(), body.description?.trim());
    await this.livestreamService.joinStream(stream.id, userId);

    return { stream, roomId: stream.id };
  }

  @Post(':id/join')
  async joinStream(@Param('id') streamId: string, @Body() body: JoinStreamDto): Promise<{ streamId: string; roomId: string }> {
    const userId = body.userId?.trim() || `guest_${Date.now()}`;
    await this.livestreamService.joinStream(streamId, userId);
    return { streamId, roomId: streamId };
  }

  @Post(':id/token')
  async getJoinToken(@Param('id') streamId: string, @Body() body: JoinTokenDto): Promise<{ token: string; roomId: string }> {
    const userId = body.userId?.trim() || `guest_${Date.now()}`;
    const username = body.username?.trim() || `Guest${Math.floor(Math.random() * 1000)}`;
    const token = await this.livestreamService.getJoinToken(streamId, userId, username);
    return { token, roomId: streamId };
  }
}
