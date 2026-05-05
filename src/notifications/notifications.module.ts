// src/notifications/notifications.module.ts

import { Module } from '@nestjs/common';
import { QueueModule } from '../queue/queue.module';
import { FanOutService } from '../dispatcher/fan-out.service';
import { NotificationsController } from '../dispatcher/notifications.controller';

@Module({
  imports: [QueueModule],
  controllers: [NotificationsController],
  providers: [FanOutService],
  exports: [FanOutService],
})
export class NotificationsModule {}
