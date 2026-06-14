import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Livestream } from '../../livestream/livestream.entity';
import { LivestreamParticipant, LivestreamRole } from '../../livestream/livestream.participant.entity';
import { LivestreamFile } from '../../livestream/livestream.file.entity';
import { ErrorHandler } from '../exceptions/error.handler';
import { ERROR_MESSAGES } from './error-messages.constant';
import { AuthorizationHelper } from '../guards/authorization.helper';
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
   * Starts a new livestream session.
   * Generates a unique room for WebRTC (video/audio/screen sharing).
   */
  async startStream(userId: string, title: string, description?: string): Promise<Livestream> {
    // Ensure user doesn't already have an active stream
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

    // Automatically add host as a participant
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
   * Used for intelligent presence tracking.
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
   * This is required for real video/audio/screen sharing.
   */
  async getJoinToken(streamId: string, userId: string, username: string): Promise<string> {
    const stream = await this.livestreamRepository.findOne({ where: { id: streamId } });
    if (!stream) {
      throw new BadRequestException(ERROR_MESSAGES.LIVESTREAM_NOT_FOUND);
    }

    // Create a LiveKit AccessToken
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
    
    // Return the updated state for the gateway to broadcast
    stream.currentPdfPage = page;
    
    return this.livestreamRepository.save(stream);
  }

  /**
   * Ends the stream and cleans up.
   */
  async endStream(streamId: string, userId: string): Promise<void> {
    const stream = await this.livestreamRepository.findOne({ where: { id: streamId } });
    
    if (!stream) return;

    AuthorizationHelper.verifyOwnership(stream.hostId, userId, ERROR_MESSAGES.NOT_THE_HOST);

    await this.livestreamRepository.update(streamId, { 
      status: 'ended', 
      endedAt: new Date() 
    });
  }

  /**
   * Paginated active streams with category filtering.
   * Essential for a realistic "Explore" feed on the Play Store.
   */
  async getActiveStreams(page: number, limit: number, category?: string) {
    const skip = (page - 1) * limit;
    const [streams, total] = await this.livestreamRepository.findAndCount({
      where: { status: 'live', ...(category && { category }) },
      relations: ['host'],
      order: { startedAt: 'DESC' },
      take: limit,
      skip,
    });
    return { streams, total, page, lastPage: Math.ceil(total / limit) };
  }

  /**
   * Checks if a user is the host of a given stream.
   * Used for intelligent permission verification.
   */
  async isHost(streamId: string, userId: string): Promise<boolean> {
    const stream = await this.livestreamRepository.findOne({ where: { id: streamId } });
    return stream?.hostId === userId;
  }

  /**
   * Retrieves all participants for a specific stream.
   */
  async getParticipants(streamId: string): Promise<LivestreamParticipant[]> {
    return this.participantRepository.find({
      where: { livestreamId: streamId },
    });
  }

  /**
   * Global Intelligent Cleanup: Removes participants who haven't sent a heartbeat in 60 seconds
   * across all active streams.
   */
  async cleanupAllInactiveParticipants(): Promise<void> {
    const expiryTime = new Date(Date.now() - 60000); // 1 minute threshold
    await this.participantRepository.delete({
      lastActiveAt: LessThan(expiryTime),
    });
  }
}