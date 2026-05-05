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
    const { channels, userId, templateId, content, data, recipient, priority, metadata } = request;
    const jobIds: string[] = [];

    this.logger.log(`Fanning out notification for user ${userId} to ${channels.length} channels: ${channels.join(', ')}`);

    for (const channel of channels) {
      const jobId = randomUUID();
      const job: NotificationJob = {
        jobId,
        userId,
        channel,
        templateId,
        content,
        data,
        recipient,
        priority,
        metadata: {
          ...metadata,
          fanOutId: jobId, // Optional: link them together
        },
      };

      await this.queueService.enqueue(job);
      jobIds.push(jobId);
    }

    return { jobIds };
  }
}
