import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Livestream } from './livestream.entity';
import { LivestreamParticipant, LivestreamRole } from './livestream-participant.entity';
import { LivestreamFile } from './livestream-file.entity';
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

    return this.participantRepository.save({
      livestreamId: streamId,
      userId,
      role: LivestreamRole.PARTICIPANT,
    });
  }

  /**
   * Persists a shared file record to the database.
   */
  async shareFile(streamId: string, userId: string, fileUrl: string, fileType: string): Promise<LivestreamFile> {
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
      canPublish: stream.hostId === userId, // Only host can publish by default
      canSubscribe: true,
    });

    return at.toJwt();
  }

  /**
   * Toggles the screen sharing state.
   * This allows the frontend to update UI for all participants (e.g., showing the PDF).
   */
  async toggleScreenShare(streamId: string, userId: string, isSharing: boolean, presentationUrl?: string): Promise<Livestream> {
    const stream = await this.livestreamRepository.findOne({ where: { id: streamId } });
    
    if (!stream) {
      throw new BadRequestException(ERROR_MESSAGES.LIVESTREAM_NOT_FOUND);
    }

    // Only the host can toggle presentation/screen share
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

    // Only the host can change the page
    AuthorizationHelper.verifyOwnership(stream.hostId, userId, ERROR_MESSAGES.NOT_THE_HOST);

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

    stream.status = 'ended';
    await this.livestreamRepository.save(stream);
  }

  async getActiveStreams(): Promise<Livestream[]> {
    return this.livestreamRepository.find({
      where: { status: 'live' },
      relations: ['host'],
    });
  }
}