// src/providers/whatsapp/conceps-whatsapp.provider.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ProviderStrategy, SendResult } from '../../dispatcher/provider.strategy';
import { NotificationJob } from '../../common/dto/notification-job.dto';
import { RenderedTemplate } from '../../templates/templates.service';
import { AppConfig, ServerConfig } from '../../config/configuration';

@Injectable()
export class ConcepsWhatsappProvider implements ProviderStrategy {
  private readonly logger = new Logger(ConcepsWhatsappProvider.name);
  private readonly concepsTokens = new Map<string, string>();
  private readonly baseUrl = 'https://api.conceps.in/v1/message/send-message';

  constructor(private readonly configService: ConfigService<AppConfig, true>) {
    const servers = this.configService.get('servers', { infer: true });

    this.initializeConcepsToken('GAMERZ_BANK', servers.GAMERZ_BANK.conceps);
    this.initializeConcepsToken('SPACE_SOLAR', servers.SPACE_SOLAR.conceps);
  }

  private initializeConcepsToken(name: string, config: ServerConfig['conceps']) {
    if (!config.token) {
      this.logger.warn(`Conceps WhatsApp token for ${name} is missing. Skipping.`);
      return;
    }
    this.concepsTokens.set(name, config.token);
    this.logger.log(`Conceps WhatsApp token for ${name} initialized successfully`);
  }

  async send(
    job: NotificationJob,
    rendered: RenderedTemplate,
  ): Promise<SendResult> {
    const waId = job.receptions?.waId;
    if (!waId) {
      throw new Error(
        `Conceps WhatsApp provider: no receptions.waId in job ${job.jobId}`,
      );
    }

    const server = job.Request_server ?? 'GAMERZ_BANK';
    const token = this.concepsTokens.get(server);

    if (!token) {
      throw new Error(`Conceps WhatsApp token for server ${server} not initialized`);
    }

    this.logger.debug(`Sending Conceps WhatsApp message (${server}): job=${job.jobId}, waId=${waId}`);

    const payload = this.buildPayload(job, rendered, waId);

    try {
      const response = await axios.post(
        `${this.baseUrl}?token=${token}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const providerRef = response.data.id || response.data.messageId || 'conceps-success';
      this.logger.log(`Conceps WhatsApp message sent successfully (${server}): job=${job.jobId}, waId=${waId}, providerRef=${providerRef}`);

      return { providerRef };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error(`Failed to send Conceps WhatsApp message for job ${job.jobId}: ${JSON.stringify(error.response?.data || error.message)}`);
      }
      throw error;
    }
  }

  private buildPayload(job: NotificationJob, rendered: RenderedTemplate, to: string) {
    if (job.templateId) {
      const templateName = (job.meta?.templateName as string) || job.templateId;
      const languageCode = (job.meta?.languageCode as string) || 'en';
      const parameters = this.extractParameters(job);

      return {
        to,
        type: 'template',
        template: {
          language: {
            policy: 'deterministic',
            code: languageCode,
          },
          name: templateName,
          components: [
            {
              type: 'body',
              parameters: parameters.map(p => ({
                type: 'text',
                text: String(p),
              })),
            },
          ],
        },
      };
    }

    return {
      to,
      type: 'text',
      text: {
        body: rendered.body,
      },
    };
  }

  private extractParameters(job: NotificationJob): any[] {
    if (Array.isArray(job.data?.parameters)) {
      return job.data.parameters;
    }
    const values = Object.values(job.data || {});
    return values.length > 0 ? values : [];
  }
}
