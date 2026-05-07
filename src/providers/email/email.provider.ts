// src/providers/email/email.provider.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SESClient,
  SendEmailCommand,
  SendEmailCommandInput,
} from '@aws-sdk/client-ses';
import { ProviderStrategy, SendResult } from '../../dispatcher/provider.strategy';
import { NotificationJob } from '../../common/dto/notification-job.dto';
import { RenderedTemplate } from '../../templates/templates.service';
import { AppConfig } from '../../config/configuration';

@Injectable()
export class EmailProvider implements ProviderStrategy {
  private readonly logger = new Logger(EmailProvider.name);
  private readonly sesClient: SESClient;
  private readonly fromAddress: string;

  constructor(private readonly configService: ConfigService<AppConfig, true>) {
    const aws = this.configService.get('aws', { infer: true });
    this.sesClient = new SESClient({
      region: aws.region,
      credentials: {
        accessKeyId: aws.accessKeyId,
        secretAccessKey: aws.secretAccessKey,
      },
    });
    this.fromAddress = aws.sesFromAddress;
  }

  async send(
    job: NotificationJob,
    rendered: RenderedTemplate,
  ): Promise<SendResult> {
    const toAddress = job.receptions?.email;
    if (!toAddress) {
      throw new Error(
        `Email provider: no receptions.email in job ${job.jobId}`,
      );
    }

    const input: SendEmailCommandInput = {
      Source: this.fromAddress,
      Destination: {
        ToAddresses: [toAddress],
      },
      Message: {
        Subject: {
          Data: rendered.subject ?? '(no subject)',
          Charset: 'UTF-8',
        },
        Body: {
          Text: {
            Data: rendered.body,
            Charset: 'UTF-8',
          },
          ...(rendered.htmlBody
            ? {
              Html: {
                Data: rendered.htmlBody,
                Charset: 'UTF-8',
              },
            }
            : {}),
        },
      },
    };

    const command = new SendEmailCommand(input);
    const response = await this.sesClient.send(command);

    const messageId = response.MessageId ?? 'unknown';
    this.logger.log(`Email sent via SES: job=${job.jobId}, to=${toAddress}, id=${messageId}`);

    return { providerRef: messageId };
  }
}
