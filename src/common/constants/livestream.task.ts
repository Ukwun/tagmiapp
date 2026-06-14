import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LivestreamService } from './livestream.service';

@Injectable()
export class LivestreamTask {
  private readonly logger = new Logger(LivestreamTask.name);

  constructor(private readonly livestreamService: LivestreamService) {}

  /**
   * Runs every minute to intelligently purge inactive users.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleParticipantCleanup() {
    this.logger.log('Running intelligent participant cleanup...');
    await this.livestreamService.cleanupAllInactiveParticipants();
  }
}