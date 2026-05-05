// src/dispatcher/notifications.controller.ts

import { Controller, Post, Body, BadRequestException, UseGuards } from '@nestjs/common';
import { FanOutService } from './fan-out.service';
import { MultiChannelNotificationSchema, MultiChannelNotification } from '../common/dto/multi-channel-notification.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly fanOutService: FanOutService) {}

  @Post('send')
  @UseGuards(JwtAuthGuard)
  async send(@Body() rawBody: unknown) {
    const result = MultiChannelNotificationSchema.safeParse(rawBody);
    
    if (!result.success) {
      throw new BadRequestException({
        message: 'Invalid notification payload',
        errors: result.error.errors,
      });
    }

    return this.fanOutService.send(result.data);
  }
}
