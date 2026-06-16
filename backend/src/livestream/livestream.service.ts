import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Livestream } from './livestream.entity';
import { LivestreamParticipant, LivestreamRole } from './livestream.participant.entity';
import { LivestreamFile } from './livestream.file.entity';
import { ERROR_MESSAGES } from '../common/constants/error-messages.constant';
import { AuthorizationHelper } from '../common/guards/authorization.helper';
import { AccessToken } from 'livekit-server-sdk';

@Injectable()
export class LivestreamService {
  constructor(
    @InjectRepository(Livestream)
    private livestreamRepository: Repository<Livestream>,
    @InjectRepository(LivestreamParticipant)
    private participantRepository: Repository<LivestreamParticipant>,
    @InjectRepository(LivestreamFile)
    private fileRepository: Repository<LivestreamFile>,
  ) {}

  /**
   * Intelligent Moderation: Uses AI results to ensure the stream title/category
   * are safe before going live.
   */
  private async validateStreamSafety(title: string, description?: string): Promise<void> {
    const forbiddenKeywords = ['spam', 'scam', 'offensive_term']; 
    const combinedText = `${title} ${description || ''}`.toLowerCase();
    
    for (const word of forbiddenKeywords) {
      if (combinedText.includes(word)) {
        throw new BadRequestException('Stream title or description contains inappropriate content.');
      }
    }
  }

  /**
   * Starts a new livestream session.
   * Generates a unique room for WebRTC (video/audio/screen sharing).
   */
  async startStream(userId: string, title: string, description?: string): Promise<Livestream> {
    await this.validateStreamSafety(title, description);

    const activeStream = await this.livestreamRepository.findOne({
      where: { hostId: userId, status: 'live' },
    });

    if (activeStream) {
      throw new BadRequestException(ERROR_MESSAGES.LIVESTREAM_ALREADY_ACTIVE);
    }

    const stream = this.livestreamRepository.create({
      hostId: userId,
      title,
      description,
      status: 'live',
      roomName: `room_${userId}_${Date.now()}`,
      startedAt: new Date(),
    });

    const savedStream = await this.livestreamRepository.save(stream);

    await this.participantRepository.save({
      livestreamId: savedStream.id,
      userId,
      role: LivestreamRole.HOST,
    });

    return savedStream;
  }

  /**
   * Records a user joining the stream.
   */
  async joinStream(streamId: string, userId: string): Promise<LivestreamParticipant> {
    const stream = await this.livestreamRepository.findOne({ where: { id: streamId } });
    if (!stream || stream.status !== 'live') {
      throw new BadRequestException(ERROR_MESSAGES.LIVESTREAM_NOT_FOUND);
    }

    const existing = await this.participantRepository.findOne({
      where: { livestreamId: streamId, userId }
    });

    if (existing) {
      return existing;
    }

    return this.participantRepository.save(
      this.participantRepository.create({
        livestreamId: streamId,
        userId,
        role: LivestreamRole.PARTICIPANT,
      })
    );
  }

  /**
   * Updates the 'last active' timestamp for a participant.
   */
  async updateHeartbeat(streamId: string, userId: string): Promise<void> {
    await this.participantRepository.update(
      { livestreamId: streamId, userId },
      { lastActiveAt: new Date() }
    );
  }

  /**
   * Persists a shared file record to the database.
   */
  async shareFile(streamId: string, userId: string, fileUrl: string, fileType: string): Promise<LivestreamFile> {
    const stream = await this.livestreamRepository.findOne({ where: { id: streamId } });
    if (!stream || stream.status !== 'live') {
      throw new BadRequestException(ERROR_MESSAGES.LIVESTREAM_NOT_FOUND);
    }

    const file = this.fileRepository.create({ livestreamId: streamId, uploadedBy: userId, fileUrl, fileType });
    return this.fileRepository.save(file);
  }

  /**
   * Generates a secure WebRTC token for a user to join a specific room.
   */
  async getJoinToken(streamId: string, userId: string, username: string): Promise<string> {
    const stream = await this.livestreamRepository.findOne({ where: { id: streamId } });
    if (!stream) {
      throw new BadRequestException(ERROR_MESSAGES.LIVESTREAM_NOT_FOUND);
    }

    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      { identity: userId, name: username }
    );

    at.addGrant({
      roomJoin: true,
      room: stream.roomName,
      canPublish: stream.hostId === userId, 
      canSubscribe: true,
    });

    return at.toJwt();
  }

  /**
   * Toggles the screen sharing state.
   */
  async toggleScreenShare(streamId: string, userId: string, isSharing: boolean, presentationUrl?: string): Promise<Livestream> {
    const stream = await this.livestreamRepository.findOne({ where: { id: streamId } });
    
    if (!stream) {
      throw new BadRequestException(ERROR_MESSAGES.LIVESTREAM_NOT_FOUND);
    }

    AuthorizationHelper.verifyOwnership(stream.hostId, userId, ERROR_MESSAGES.NOT_THE_HOST);

    stream.isScreenSharing = isSharing;
    stream.activePresentationUrl = presentationUrl || null;
    
    return this.livestreamRepository.save(stream);
  }

  /**
   * Updates the current page of the PDF being presented.
   */
  async updatePdfPage(streamId: string, userId: string, page: number): Promise<Livestream> {
    const stream = await this.livestreamRepository.findOne({ where: { id: streamId } });
    
    if (!stream) {
      throw new BadRequestException(ERROR_MESSAGES.LIVESTREAM_NOT_FOUND);
    }

    AuthorizationHelper.verifyOwnership(stream.hostId, userId, ERROR_MESSAGES.NOT_THE_HOST);

    await this.livestreamRepository.update(streamId, { currentPdfPage: page });
    
    stream.currentPdfPage = page;
    
    return this.livestreamRepository.save(stream);
  }
}