// src/dispatcher/fan-out.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { QueueService } from '../queue/queue.service';
import { MultiChannelNotification } from '../common/dto/multi-channel-notification.dto';
import { NotificationJob } from '../common/dto/notification-job.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class FanOutService {
  private readonly logger = new Logger(FanOutService.name);

  constructor(private readonly queueService: QueueService) {}

  /**
   * Enqueues separate jobs for each requested channel.
   */
  async send(request: MultiChannelNotification): Promise<{ jobIds: string[] }> {
    const { providers, userId, templateId, data, receptions, priority, meta } = request;
    const jobIds: string[] = [];

    this.logger.log(`Fanning out notification for user ${userId} to ${providers.length} providers: ${providers.join(', ')}`);

    for (const provider of providers) {
      const jobId = randomUUID();
      const job: NotificationJob = {
        jobId,
        userId,
        provider,
        templateId,
        data,
        receptions,
        priority,
        meta: {
          ...meta,
          fanOutId: jobId, // Optional: link them together
        },
      };

      await this.queueService.enqueue(job);
      jobIds.push(jobId);
    }

    return { jobIds };
  }
}
