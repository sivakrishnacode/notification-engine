// src/providers/sms/sms.provider.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SNSClient,
  PublishCommand,
} from '@aws-sdk/client-sns';
import { ChannelStrategy, SendResult } from '../../dispatcher/channel.strategy';
import { NotificationJob } from '../../common/dto/notification-job.dto';
import { RenderedTemplate } from '../../templates/templates.service';
import { AppConfig } from '../../config/configuration';

@Injectable()
export class SmsProvider implements ChannelStrategy {
  private readonly logger = new Logger(SmsProvider.name);
  private readonly snsClient: SNSClient;

  constructor(private readonly configService: ConfigService<AppConfig, true>) {
    const aws = this.configService.get('aws', { infer: true });
    this.snsClient = new SNSClient({
      region: aws.region,
      credentials: {
        accessKeyId: aws.accessKeyId,
        secretAccessKey: aws.secretAccessKey,
      },
    });
  }

  async send(
    job: NotificationJob,
    rendered: RenderedTemplate,
  ): Promise<SendResult> {
    const phoneNumber = job.recipient?.phone;
    if (!phoneNumber) {
      throw new Error(
        `SMS provider: no recipient.phone in job ${job.jobId}`,
      );
    }

    const command = new PublishCommand({
      PhoneNumber: phoneNumber,
      Message: rendered.body,
    });

    const response = await this.snsClient.send(command);
    const messageId = response.MessageId ?? 'unknown';

    this.logger.log(`SMS sent via SNS: job=${job.jobId}, phone=${phoneNumber}, id=${messageId}`);

    return { providerRef: messageId };
  }
}
