// src/queue/notification.processor.ts

import {
  Processor,
  WorkerHost,
  OnWorkerEvent,
  InjectQueue,
} from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, Queue, UnrecoverableError } from 'bullmq';
import {
  NotificationJobSchema,
  NotificationJob,
} from '../common/dto/notification-job.dto';
import { RateLimitService } from '../rate-limit/rate-limit.service';
import { TemplatesService } from '../templates/templates.service';
import { DispatcherService } from '../dispatcher/dispatcher.service';
import { DeliveryLogService } from '../delivery-log/delivery-log.service';

@Processor('notifications', {
  concurrency: parseInt(process.env['WORKER_CONCURRENCY'] || '5', 10),
})
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly rateLimit: RateLimitService,
    private readonly templates: TemplatesService,
    private readonly dispatcher: DispatcherService,
    private readonly deliveryLog: DeliveryLogService,
    @InjectQueue('notifications-dlq') private readonly dlqQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<void> {
    const { id, data: rawData } = job;
    this.logger.debug(`Processing notification job: ${id}`);

    // 1. Validate payload with Zod
    const validationResult = NotificationJobSchema.safeParse(rawData);
    if (!validationResult.success) {
      this.logger.error(`Invalid job payload for job ${id}: ${JSON.stringify(validationResult.error.errors)}`);
      throw new UnrecoverableError('Invalid notification job payload');
    }

    const notificationJob: NotificationJob = validationResult.data;
    if (!notificationJob.jobId) {
      notificationJob.jobId = String(id);
    }
    const { userId, channel, templateId, data } = notificationJob;

    try {
      // 2. Rate limiting
      const isRateLimited = !(await this.rateLimit.allow(userId, channel));
      if (isRateLimited) {
        await this.deliveryLog.write({
          jobId: id!,
          userId,
          channel,
          status: 'RATE_LIMITED',
        });
        // Throwing error triggers BullMQ retry logic
        throw new Error(`Rate limit exceeded for user ${userId} on channel ${channel}`);
      }

      // 4. Render template or use direct content
      let rendered;
      if (notificationJob.templateId) {
        rendered = await this.templates.render(
          notificationJob.templateId,
          channel,
          data || {},
        );
      } else if (notificationJob.content) {
        rendered = {
          subject: notificationJob.content.subject,
          body: notificationJob.content.body!, // Refinement ensures body exists if no templateId
          htmlBody: notificationJob.content.htmlBody,
        };
      } else {
        throw new UnrecoverableError(
          'Internal logic error: neither templateId nor content provided after validation',
        );
      }

      // 5. Dispatch notification
      const result = await this.dispatcher.send(notificationJob, rendered);

      // 6. Write success log
      if (channel !== 'in_app') {
        await this.deliveryLog.write({
          jobId: id!,
          userId,
          channel,
          status: 'DELIVERED',
          providerRef: result.providerRef,
        });
      }

      this.logger.log(`Notification delivered: job=${id}, channel=${channel}, user=${userId}, ref=${result.providerRef}`);
    } catch (error) {
      if (error instanceof UnrecoverableError) throw error;

      this.logger.error(`Job ${id} failed: ${(error as Error).message}`);

      // Write failure log
      await this.deliveryLog.write({
        jobId: id!,
        userId,
        channel,
        status: 'FAILED',
        error: (error as Error).message,
      });

      throw error; // Re-throw for BullMQ retry
    }
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed event: ${error.message}`);

    // Dead letter queue logic
    const maxAttempts = job.opts.attempts || 5;
    if (job.attemptsMade >= maxAttempts) {
      this.logger.warn(`Moving job ${job.id} to DLQ`);
      await this.dlqQueue.add(job.name, job.data, {
        jobId: `dlq-${job.id}`,
        removeOnComplete: true,
      });
    }
  }
}
