// src/providers/push/push.provider.ts

import { Injectable, Logger } from '@nestjs/common';
import { ChannelStrategy, SendResult } from '../../dispatcher/channel.strategy';
import { NotificationJob } from '../../common/dto/notification-job.dto';
import { RenderedTemplate } from '../../templates/templates.service';
import * as admin from 'firebase-admin';
import * as serviceAccount from './ssdealer-33dc1-firebase-adminsdk-fbsvc-1e892cbe38.json';
import { Message } from 'firebase-admin/lib/messaging/messaging-api';

@Injectable()
export class PushProvider implements ChannelStrategy {
  private readonly logger = new Logger(PushProvider.name);

  constructor() {
    if (!admin.apps.length) {
      // Create a mutable copy of the service account to avoid "only a getter" errors
      const sa = { ...serviceAccount } as admin.ServiceAccount;
      admin.initializeApp({
        credential: admin.credential.cert(sa),
      });
      this.logger.log('Firebase Admin SDK initialized successfully');
    }
  }

  async send(
    job: NotificationJob,
    rendered: RenderedTemplate,
  ): Promise<SendResult> {
    const deviceToken = job.recipient?.deviceToken;
    if (!deviceToken) {
      throw new Error(
        `Push provider: no recipient.deviceToken in job ${job.jobId}`,
      );
    }

    try {
      const message: Message = {
        notification: {
          title: rendered.subject ?? 'Notification',
          body: rendered.body,
          // image : ''
          imageUrl: 'https://file-examples.com/storage/fe1596838569f9c5b943e40/2017/10/file_example_JPG_100kB.jpg'
        },
        token: deviceToken,
      };

      console.log("---------------------", message)

      const response = await admin.messaging().send(message);

      this.logger.log(`Push notification sent: job=${job.jobId}, to=${deviceToken}, id=${response}`);

      return { providerRef: response };
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
