// src/dispatcher/dispatcher.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ChannelStrategy, SendResult } from './channel.strategy';
import { NotificationJob } from '../common/dto/notification-job.dto';
import { RenderedTemplate } from '../templates/templates.service';
import { EmailProvider } from '../providers/email/email.provider';
import { SmsProvider } from '../providers/sms/sms.provider';
import { PushProvider } from '../providers/push/push.provider';
import { MetaWhatsappProvider } from '../providers/whatsapp/meta-whatsapp.provider';
import { ConcepsWhatsappProvider } from '../providers/whatsapp/conceps-whatsapp.provider';
import { InAppProvider } from '../providers/in-app/in-app.provider';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../config/configuration';

@Injectable()
export class DispatcherService {
  private readonly logger = new Logger(DispatcherService.name);
  private readonly strategies: Map<string, ChannelStrategy>;

  constructor(
    private readonly emailProvider: EmailProvider,
    private readonly smsProvider: SmsProvider,
    private readonly pushProvider: PushProvider,
    private readonly metaWhatsappProvider: MetaWhatsappProvider,
    private readonly concepsWhatsappProvider: ConcepsWhatsappProvider,
    private readonly inAppProvider: InAppProvider,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {
    this.strategies = new Map<string, ChannelStrategy>([
      ['email', this.emailProvider],
      ['sms', this.smsProvider],
      ['push', this.pushProvider],
      ['whatsapp_meta', this.metaWhatsappProvider],
      ['whatsapp_conceps', this.concepsWhatsappProvider],
      ['in_app', this.inAppProvider],
    ]);
  }

  async send(
    job: NotificationJob,
    rendered: RenderedTemplate,
  ): Promise<SendResult> {
    let strategyKey: string = job.provider;

    if (job.provider === 'whatsapp') {
      const preferredProvider = (job.meta?.whatsappProvider as string) || this.configService.get('whatsappProvider', { infer: true });
      strategyKey = `whatsapp_${preferredProvider}`;
    }

    const strategy = this.strategies.get(strategyKey);

    if (!strategy) {
      this.logger.error(`No strategy found for key: ${strategyKey} (provider: ${job.provider})`);
      throw new Error(`Unsupported provider: ${strategyKey}`);
    }

    this.logger.debug(`Routing job ${job.jobId} to provider ${strategyKey}`);

    return strategy.send(job, rendered);
  }
}
