// src/delivery-log/delivery-log.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeliveryLog, Prisma } from '@prisma/client';

export type DeliveryStatus = 'DELIVERED' | 'FAILED' | 'SKIPPED' | 'RATE_LIMITED';

export interface WriteLogOptions {
  jobId: string;
  userId: string;
  channel: string;
  status: DeliveryStatus;
  providerRef?: string;
  error?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class DeliveryLogService {
  constructor(private readonly prisma: PrismaService) { }

  async write(options: WriteLogOptions): Promise<DeliveryLog> {
    return this.prisma.deliveryLog.create({
      data: {
        jobId: options.jobId,
        userId: options.userId,
        channel: options.channel,
        status: options.status,
        providerRef: options.providerRef ?? null,
        error: options.error ?? null,
        metadata: (options.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      },
    });
  }
}
