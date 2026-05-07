// src/queue/queue.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NotificationJob } from '../common/dto/notification-job.dto';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue('notifications') private readonly notificationQueue: Queue,
  ) {}

  async enqueue(job: NotificationJob): Promise<void> {
    const { jobId, priority, scheduledAt, ...rest } = job;

    const delay = scheduledAt
      ? Math.max(0, new Date(scheduledAt).getTime() - Date.now())
      : 0;

    await this.notificationQueue.add(jobId, job, {
      jobId,
      priority: priority ?? 0,
      delay,
      removeOnComplete: { count: 200 },
      removeOnFail: false,
    });

    this.logger.log(
      { jobId, provider: job.provider, delay, priority },
      'Notification job enqueued successfully',
    );
  }
}
