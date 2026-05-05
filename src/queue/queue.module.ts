// src/queue/queue.module.ts

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';
import { NotificationProcessor } from './notification.processor';
import { RateLimitModule } from '../rate-limit/rate-limit.module';
import { TemplatesModule } from '../templates/templates.module';
import { DispatcherModule } from '../dispatcher/dispatcher.module';
import { DeliveryLogModule } from '../delivery-log/delivery-log.module';
import { AppConfig } from '../config/configuration';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<AppConfig, true>) => {
        const redis = configService.get('redis', { infer: true });
        return {
          connection: {
            host: redis.host,
            port: redis.port,
          },
        };
      },
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      {
        name: 'notifications',
        defaultJobOptions: {
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 3000,
          },
          removeOnComplete: { count: 1000 },
          removeOnFail: { count: 5000 },
        },
      },
      {
        name: 'notifications-dlq',
      },
    ),
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
    }),
    BullBoardModule.forFeature(
      {
        name: 'notifications',
        adapter: BullMQAdapter,
      },
      {
        name: 'notifications-dlq',
        adapter: BullMQAdapter,
      },
    ),
    RateLimitModule,
    TemplatesModule,
    DispatcherModule,
    DeliveryLogModule,
  ],
  providers: [QueueService, NotificationProcessor],
  exports: [QueueService],
})
export class QueueModule {}
