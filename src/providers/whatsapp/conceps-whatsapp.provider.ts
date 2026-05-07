// src/providers/whatsapp/conceps-whatsapp.provider.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ProviderStrategy, SendResult } from '../../dispatcher/provider.strategy';
import { NotificationJob } from '../../common/dto/notification-job.dto';
import { RenderedTemplate } from '../../templates/templates.service';
import { AppConfig } from '../../config/configuration';

@Injectable()
export class ConcepsWhatsappProvider implements ProviderStrategy {
  private readonly logger = new Logger(ConcepsWhatsappProvider.name);
  private readonly token: string;
  private readonly baseUrl = 'https://api.conceps.in/v1/message/send-message';

  constructor(private readonly configService: ConfigService<AppConfig, true>) {
    const conceps = this.configService.get('conceps', { infer: true });
    this.token = conceps.token;
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

    this.logger.debug(`Sending Conceps WhatsApp message: job=${job.jobId}, waId=${waId}`);

    const payload = this.buildPayload(job, rendered, waId);

    try {
      const response = await axios.post(
        `${this.baseUrl}?token=${this.token}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      // Conceps API response might vary, usually contains a message ID or success status
      const providerRef = response.data.id || response.data.messageId || 'conceps-success';
      this.logger.log(`Conceps WhatsApp message sent successfully: job=${job.jobId}, waId=${waId}, providerRef=${providerRef}`);

      return { providerRef };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error(`Failed to send Conceps WhatsApp message for job ${job.jobId}: ${JSON.stringify(error.response?.data || error.message)}`);
      }
      throw error;
    }
  }

  private buildPayload(job: NotificationJob, rendered: RenderedTemplate, to: string) {
    // If templateId is provided, we assume it's a template message
    if (job.templateId) {
      // In a real scenario, we might want to fetch the template details to get the name
      // For now, we'll use the job.meta?.templateName if provided, otherwise fallback to templateId
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

    // Fallback to text message if no templateId
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

    // If data is just a flat object, we could try to extract numbered parameters or use all values
    // For now, let's just return an empty array or handle specific keys if necessary
    const values = Object.values(job.data || {});
    return values.length > 0 ? values : [];
  }
}
