// src/providers/email/email.provider.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SESClient,
  SendEmailCommand,
  SendEmailCommandInput,
} from '@aws-sdk/client-ses';
import { ProviderStrategy, SendResult, RenderedContent } from '../../dispatcher/provider.strategy';
import { NotificationJob } from '../../common/dto/notification-job.dto';
import { AppConfig, ServerConfig } from '../../config/configuration';

@Injectable()
export class EmailProvider implements ProviderStrategy {
  private readonly logger = new Logger(EmailProvider.name);
  private readonly sesConfigs = new Map<string, { client: SESClient; fromAddress: string }>();

  constructor(private readonly configService: ConfigService<AppConfig, true>) {
    const servers = this.configService.get('servers', { infer: true });

    this.initializeSesClient('GAMERZ_BANK', servers.GAMERZ_BANK.aws);
    this.initializeSesClient('SPACE_SOLAR', servers.SPACE_SOLAR.aws);
  }

  private initializeSesClient(name: string, config: ServerConfig['aws']) {
    if (!config.accessKeyId || !config.secretAccessKey) {
      this.logger.warn(`AWS SES config for ${name} is incomplete. Skipping.`);
      return;
    }

    const client = new SESClient({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    this.sesConfigs.set(name, { client, fromAddress: config.sesFromAddress });
    this.logger.log(`SES client for ${name} initialized successfully`);
  }

  async send(
    job: NotificationJob,
    content: RenderedContent,
  ): Promise<SendResult> {
    const toAddress = job.receptions?.email;
    if (!toAddress) {
      throw new Error(
        `Email provider: no receptions.email in job ${job.jobId}`,
      );
    }

    const server = job.Request_server ?? 'GAMERZ_BANK';
    const sesConfig = this.sesConfigs.get(server);

    if (!sesConfig) {
      throw new Error(`SES client for server ${server} not initialized`);
    }

    const input: SendEmailCommandInput = {
      Source: sesConfig.fromAddress,
      Destination: {
        ToAddresses: [toAddress],
      },
      Message: {
        Subject: {
          Data: content.subject ?? '(no subject)',
          Charset: 'UTF-8',
        },
        Body: {
          Text: {
            Data: content.body,
            Charset: 'UTF-8',
          },
          ...(content.htmlBody
            ? {
              Html: {
                Data: content.htmlBody,
                Charset: 'UTF-8',
              },
            }
            : {}),
        },
      },
    };

    const command = new SendEmailCommand(input);
    const response = await sesConfig.client.send(command);

    const messageId = response.MessageId ?? 'unknown';
    this.logger.log(`Email sent via SES (${server}): job=${job.jobId}, to=${toAddress}, id=${messageId}`);

    return { providerRef: messageId };
  }
}
