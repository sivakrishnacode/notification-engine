// src/dispatcher/dispatcher.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ProviderStrategy, SendResult, RenderedContent } from './provider.strategy';
import { NotificationJob } from '../common/dto/notification-job.dto';
import { EmailProvider } from '../providers/email/email.provider';
import { SmsProvider } from '../providers/sms/sms.provider';
import { PushProvider } from '../providers/push/push.provider';
import { ConcepsWhatsappProvider } from '../providers/whatsapp/conceps-whatsapp.provider';
import { InAppProvider } from '../providers/in-app/in-app.provider';

@Injectable()
export class DispatcherService {
  private readonly logger = new Logger(DispatcherService.name);
  private readonly strategies: Map<string, ProviderStrategy>;

  constructor(
    private readonly emailProvider: EmailProvider,
    private readonly smsProvider: SmsProvider,
    private readonly pushProvider: PushProvider,
    private readonly concepsWhatsappProvider: ConcepsWhatsappProvider,
    private readonly inAppProvider: InAppProvider,
  ) {
    this.strategies = new Map<string, ProviderStrategy>([
      ['email', this.emailProvider],
      ['sms', this.smsProvider],
      ['push', this.pushProvider],
      ['whatsapp', this.concepsWhatsappProvider],
      ['in_app', this.inAppProvider],
    ]);
  }

  async send(
    job: NotificationJob,
    content: RenderedContent,
  ): Promise<SendResult> {
    const strategy = this.strategies.get(job.provider);

    if (!strategy) {
      this.logger.error(`No strategy found for provider: ${job.provider}`);
      throw new Error(`Unsupported provider: ${job.provider}`);
    }

    this.logger.debug(`Routing job ${job.jobId} to provider ${job.provider}`);

    return strategy.send(job, content);
  }
}
