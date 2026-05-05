// src/delivery-log/delivery-log.module.ts

import { Module } from '@nestjs/common';
import { DeliveryLogService } from './delivery-log.service';

@Module({
  providers: [DeliveryLogService],
  exports: [DeliveryLogService],
})
export class DeliveryLogModule {}
