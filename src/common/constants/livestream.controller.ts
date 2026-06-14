import { Controller, Post, Body, UseGuards, Req, Get, Param, Query } from '@nestjs/common';
import { LivestreamService } from './livestream.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('livestream')
export class LivestreamController {
  constructor(private readonly livestreamService: LivestreamService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('start')
  async startStream(@Req() req: Request, @Body('title') title: string, @Body('description') description?: string) {
    const userId = req.user['id']; 
    const stream = await this.livestreamService.startStream(userId, title, description);
    return { message: 'Livestream started successfully', streamId: stream.id, roomName: stream.roomName };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('end/:streamId')
  async endStream(@Req() req: Request, @Param('streamId') streamId: string) {
    const userId = req.user['id'];
    await this.livestreamService.endStream(streamId, userId);
    return { message: 'Livestream ended successfully' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('token/:streamId')
  async getJoinToken(@Req() req: Request, @Param('streamId') streamId: string) {
    const userId = req.user['id'];
    const username = req.user['username'];
    const token = await this.livestreamService.getJoinToken(streamId, userId, username);
    return { token };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('active')
  async getActiveStreams(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('category') category?: string,
  ) {
    return this.livestreamService.getActiveStreams(page, limit, category);
  }
}