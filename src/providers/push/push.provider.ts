// src/providers/push/push.provider.ts

import { Injectable, Logger } from '@nestjs/common';
import { ProviderStrategy, SendResult } from '../../dispatcher/provider.strategy';
import { NotificationJob } from '../../common/dto/notification-job.dto';
import { RenderedTemplate } from '../../templates/templates.service';
import * as admin from 'firebase-admin';
import { Message } from 'firebase-admin/lib/messaging/messaging-api';

@Injectable()
export class PushProvider implements ProviderStrategy {
  private readonly logger = new Logger(PushProvider.name);

  constructor() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Replace literal '\n' characters with actual line breaks
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
      this.logger.log('Firebase Admin SDK initialized successfully');
    }
  }

  async send(
    job: NotificationJob,
    rendered: RenderedTemplate,
  ): Promise<SendResult> {
    const deviceToken = job.receptions?.deviceToken;
    if (!deviceToken) {
      throw new Error(
        `Push provider: no receptions.deviceToken in job ${job.jobId}`,
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
