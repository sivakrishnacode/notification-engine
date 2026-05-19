// src/providers/push/push.provider.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProviderStrategy, SendResult, RenderedContent } from '../../dispatcher/provider.strategy';
import { NotificationJob } from '../../common/dto/notification-job.dto';
import * as admin from 'firebase-admin';
import { Message } from 'firebase-admin/lib/messaging/messaging-api';
import { AppConfig } from '../../config/configuration';

@Injectable()
export class PushProvider implements ProviderStrategy {
  private readonly logger = new Logger(PushProvider.name);

  constructor(private readonly configService: ConfigService<AppConfig, true>) {
    const servers = this.configService.get('servers', { infer: true });

    this.initializeFirebaseApp('GAMERZ_BANK', servers.GAMERZ_BANK.firebase);
    this.initializeFirebaseApp('SPACE_SOLAR', servers.SPACE_SOLAR.firebase);
  }

  private initializeFirebaseApp(name: string, config: any) {
    if (!config.projectId || !config.privateKey || !config.clientEmail) {
      this.logger.warn(`Firebase config for ${name} is incomplete. Skipping initialization.`);
      return;
    }

    if (!admin.apps.find((app) => app?.name === name)) {
      try {
        admin.initializeApp(
          {
            credential: admin.credential.cert({
              projectId: config.projectId,
              clientEmail: config.clientEmail,
              privateKey: config.privateKey.replace(/\\n/g, '\n'),
            }),
          },
          name,
        );
        this.logger.log(`Firebase Admin SDK for ${name} initialized successfully`);
      } catch (error) {
        this.logger.error(`Failed to initialize Firebase Admin SDK for ${name}: ${(error as Error).message}`);
      }
    }
  }

  async send(
    job: NotificationJob,
    content: RenderedContent,
  ): Promise<SendResult> {
    const deviceToken = job.receptions?.deviceToken;
    if (!deviceToken) {
      throw new Error(
        `Push provider: no receptions.deviceToken in job ${job.jobId}`,
      );
    }

    try {
      const server = job.Request_server ?? 'GAMERZ_BANK';
      const app = admin.apps.find((a) => a?.name === server);

      if (!app) {
        throw new Error(`Firebase app for server ${server} not initialized`);
      }

      const message: Message = {
        notification: {
          title: content.subject ?? 'Notification',
          body: content.body,
          imageUrl: 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg'
        },
        token: deviceToken,
      };

      const response = await admin.messaging(app).send(message);

      this.logger.log(`Push notification sent (${server}): job=${job.jobId}, to=${deviceToken}, id=${response}`);

      return { providerRef: response };
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
