// src/providers/whatsapp/meta-whatsapp.provider.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ChannelStrategy, SendResult } from '../../dispatcher/channel.strategy';
import { NotificationJob } from '../../common/dto/notification-job.dto';
import { RenderedTemplate } from '../../templates/templates.service';
import { AppConfig } from '../../config/configuration';

@Injectable()
export class MetaWhatsappProvider implements ChannelStrategy {
  private readonly logger = new Logger(MetaWhatsappProvider.name);
  private readonly phoneNumberId: string;
  private readonly accessToken: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService<AppConfig, true>) {
    const meta = this.configService.get('meta', { infer: true });
    this.phoneNumberId = meta.phoneNumberId;
    this.accessToken = meta.accessToken;
    this.baseUrl = `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`;
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

    this.logger.debug(`Sending WhatsApp message: job=${job.jobId}, waId=${waId}`);

    try {
      const response = await axios.post(
        this.baseUrl,
        {
          messaging_product: 'whatsapp',
          to: waId,
          type: 'text',
          text: { body: rendered.body },
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const providerRef = response.data.messages[0].id;
      this.logger.log(`WhatsApp message sent successfully: job=${job.jobId}, waId=${waId}, providerRef=${providerRef}`);

      return { providerRef };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error(`Failed to send WhatsApp message for job ${job.jobId}: ${JSON.stringify(error.response?.data || error.message)}`);
      }
      throw error;
    }
  }
}
