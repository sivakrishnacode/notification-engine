// src/dispatcher/dispatcher.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ChannelStrategy, SendResult } from './channel.strategy';
import { NotificationJob } from '../common/dto/notification-job.dto';
import { RenderedTemplate } from '../templates/templates.service';
import { EmailProvider } from '../providers/email/email.provider';
import { SmsProvider } from '../providers/sms/sms.provider';
import { PushProvider } from '../providers/push/push.provider';
import { WhatsappProvider } from '../providers/whatsapp/whatsapp.provider';
import { InAppProvider } from '../providers/in-app/in-app.provider';

@Injectable()
export class DispatcherService {
  private readonly logger = new Logger(DispatcherService.name);
  private readonly strategies: Map<string, ChannelStrategy>;

  constructor(
    private readonly emailProvider: EmailProvider,
    private readonly smsProvider: SmsProvider,
    private readonly pushProvider: PushProvider,
    private readonly whatsappProvider: WhatsappProvider,
    private readonly inAppProvider: InAppProvider,
  ) {
    this.strategies = new Map<string, ChannelStrategy>([
      ['email', this.emailProvider],
      ['sms', this.smsProvider],
      ['push', this.pushProvider],
      ['whatsapp', this.whatsappProvider],
      ['in_app', this.inAppProvider],
    ]);
  }

  async send(
    job: NotificationJob,
    rendered: RenderedTemplate,
  ): Promise<SendResult> {
    const strategy = this.strategies.get(job.channel);

    if (!strategy) {
      this.logger.error(`No strategy found for channel: ${job.channel}`);
      throw new Error(`Unsupported channel: ${job.channel}`);
    }

    this.logger.debug(`Routing job ${job.jobId} to provider for channel ${job.channel}`);

    return strategy.send(job, rendered);
  }
}
