// src/providers/whatsapp/meta-whatsapp.provider.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ProviderStrategy, SendResult } from '../../dispatcher/provider.strategy';
import { NotificationJob } from '../../common/dto/notification-job.dto';
import { RenderedTemplate } from '../../templates/templates.service';
import { AppConfig, ServerConfig } from '../../config/configuration';

@Injectable()
export class MetaWhatsappProvider implements ProviderStrategy {
  private readonly logger = new Logger(MetaWhatsappProvider.name);
  private readonly metaConfigs = new Map<string, ServerConfig['meta']>();

  constructor(private readonly configService: ConfigService<AppConfig, true>) {
    const servers = this.configService.get('servers', { infer: true });

    this.initializeMetaConfig('GAMERZ_BANK', servers.GAMERZ_BANK.meta);
    this.initializeMetaConfig('SPACE_SOLAR', servers.SPACE_SOLAR.meta);
  }

  private initializeMetaConfig(name: string, config: ServerConfig['meta']) {
    if (!config.phoneNumberId || !config.accessToken) {
      this.logger.warn(`Meta WhatsApp config for ${name} is incomplete. Skipping.`);
      return;
    }
    this.metaConfigs.set(name, config);
    this.logger.log(`Meta WhatsApp config for ${name} initialized successfully`);
  }

  async send(
    job: NotificationJob,
    rendered: RenderedTemplate,
  ): Promise<SendResult> {
    const waId = job.receptions?.waId;
    if (!waId) {
      throw new Error(
        `WhatsApp provider: no receptions.waId in job ${job.jobId}`,
      );
    }

    const server = job.Request_server ?? 'GAMERZ_BANK';
    const config = this.metaConfigs.get(server);

    if (!config) {
      throw new Error(`Meta WhatsApp config for server ${server} not initialized`);
    }

    const baseUrl = `https://graph.facebook.com/v19.0/${config.phoneNumberId}/messages`;

    this.logger.debug(`Sending Meta WhatsApp message (${server}): job=${job.jobId}, waId=${waId}`);

    try {
      const response = await axios.post(
        baseUrl,
        {
          messaging_product: 'whatsapp',
          to: waId,
          type: 'text',
          text: { body: rendered.body },
        },
        {
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const providerRef = response.data.messages[0].id;
      this.logger.log(`Meta WhatsApp message sent successfully (${server}): job=${job.jobId}, waId=${waId}, providerRef=${providerRef}`);

      return { providerRef };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error(`Failed to send Meta WhatsApp message for job ${job.jobId}: ${JSON.stringify(error.response?.data || error.message)}`);
      }
      throw error;
    }
  }
}
