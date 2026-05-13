// src/app.module.ts

import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { QueueModule } from './queue/queue.module';
import { DispatcherModule } from './dispatcher/dispatcher.module';
import { ProvidersModule } from './providers/providers.module';
import { RateLimitModule } from './rate-limit/rate-limit.module';
import { DeliveryLogModule } from './delivery-log/delivery-log.module';
import { WebsocketModule } from './websocket/websocket.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    QueueModule,
    DispatcherModule,
    ProvidersModule,
    RateLimitModule,
    DeliveryLogModule,
    WebsocketModule,
    HealthModule,
    AuthModule,
    NotificationsModule,
  ],
  controllers: [AppController],
})
export class AppModule { }
