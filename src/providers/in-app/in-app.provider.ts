// src/providers/in-app/in-app.provider.ts

import { Injectable, Logger } from '@nestjs/common';
import { ProviderStrategy, SendResult } from '../../dispatcher/provider.strategy';
import { NotificationJob } from '../../common/dto/notification-job.dto';
import { RenderedTemplate } from '../../templates/templates.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationGateway } from '../../websocket/notification.gateway';

@Injectable()
export class InAppProvider implements ProviderStrategy {
  private readonly logger = new Logger(InAppProvider.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationGateway,
  ) {}

  async send(
    job: NotificationJob,
    rendered: RenderedTemplate,
  ): Promise<SendResult> {
    this.logger.debug(`Saving in-app notification: job=${job.jobId}, user=${job.userId}`);

    // 1. Insert DeliveryLog row via PrismaService (as the primary storage for in-app)
    const log = await this.prisma.deliveryLog.create({
      data: {
        jobId: job.jobId,
        userId: job.userId,
        channel: 'in_app',
        status: 'DELIVERED',
        metadata: {
          jobId: job.jobId,
          provider: job.provider,
          templateId: job.templateId,
          ...((job.meta as any) || {}),
        },
      },
    });

    // 2. Emit Socket.io event "notification" to room userId
    this.gateway.emitToUser(job.userId, {
      id: log.id,
      jobId: job.jobId,
      subject: rendered.subject,
      body: rendered.body,
      createdAt: log.createdAt,
    });

    this.logger.log(
      { jobId: job.jobId, userId: job.userId, logId: log.id },
      'In-app notification delivered and emitted',
    );

    // 3. Return DB record id as providerRef
    return { providerRef: log.id };
  }
}
