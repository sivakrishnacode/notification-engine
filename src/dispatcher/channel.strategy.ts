// src/dispatcher/channel.strategy.ts

import { NotificationJob } from '../common/dto/notification-job.dto';
import { RenderedTemplate } from '../templates/templates.service';

export interface SendResult {
  providerRef: string;
}

export interface ChannelStrategy {
  send(job: NotificationJob, rendered: RenderedTemplate): Promise<SendResult>;
}
