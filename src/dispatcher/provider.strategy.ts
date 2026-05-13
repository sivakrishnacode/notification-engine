// src/dispatcher/provider.strategy.ts

import { NotificationJob } from '../common/dto/notification-job.dto';

export interface RenderedContent {
  subject?: string;
  body: string;
  htmlBody?: string;
}

export interface SendResult {
  providerRef: string;
}

export interface ProviderStrategy {
  send(job: NotificationJob, content: RenderedContent): Promise<SendResult>;
}
