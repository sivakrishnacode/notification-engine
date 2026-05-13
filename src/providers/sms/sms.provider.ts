// src/providers/sms/sms.provider.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SNSClient,
  PublishCommand,
} from '@aws-sdk/client-sns';
import { ProviderStrategy, SendResult, RenderedContent } from '../../dispatcher/provider.strategy';
import { NotificationJob } from '../../common/dto/notification-job.dto';
import { AppConfig, ServerConfig } from '../../config/configuration';

@Injectable()
export class SmsProvider implements ProviderStrategy {
  private readonly logger = new Logger(SmsProvider.name);
  private readonly snsClients = new Map<string, SNSClient>();

  constructor(private readonly configService: ConfigService<AppConfig, true>) {
    const servers = this.configService.get('servers', { infer: true });

    this.initializeSnsClient('GAMERZ_BANK', servers.GAMERZ_BANK.aws);
    this.initializeSnsClient('SPACE_SOLAR', servers.SPACE_SOLAR.aws);
  }

  private initializeSnsClient(name: string, config: ServerConfig['aws']) {
    if (!config.accessKeyId || !config.secretAccessKey) {
      this.logger.warn(`AWS SNS config for ${name} is incomplete. Skipping.`);
      return;
    }

    const client = new SNSClient({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    this.snsClients.set(name, client);
    this.logger.log(`SNS client for ${name} initialized successfully`);
  }

  async send(
    job: NotificationJob,
    content: RenderedContent,
  ): Promise<SendResult> {
    const phoneNumber = job.receptions?.phone;
    if (!phoneNumber) {
      throw new Error(
        `SMS provider: no receptions.phone in job ${job.jobId}`,
      );
    }

    const server = job.Request_server ?? 'GAMERZ_BANK';
    const snsClient = this.snsClients.get(server);

    if (!snsClient) {
      throw new Error(`SNS client for server ${server} not initialized`);
    }

    const command = new PublishCommand({
      PhoneNumber: phoneNumber,
      Message: content.body,
    });

    const response = await snsClient.send(command);
    const messageId = response.MessageId ?? 'unknown';

    this.logger.log(`SMS sent via SNS (${server}): job=${job.jobId}, phone=${phoneNumber}, id=${messageId}`);

    return { providerRef: messageId };
  }
}
