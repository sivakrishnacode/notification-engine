// src/health/health.controller.ts

import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private prismaIndicator: PrismaHealthIndicator,
    private prismaService: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Check database connectivity
      () => this.prismaIndicator.pingCheck('database', this.prismaService),
      // Check if the service is reachable (self-check)
      () => this.http.pingCheck('service', 'http://localhost:3000/health'),
    ]);
  }
}
