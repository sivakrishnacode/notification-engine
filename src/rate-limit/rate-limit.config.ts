// src/rate-limit/rate-limit.config.ts

import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../config/configuration';

export interface ChannelRateLimits {
  email: number;
  sms: number;
  push: number;
  whatsapp: number;
  in_app: number;
}

export function buildRateLimitConfig(
  configService: ConfigService<AppConfig, true>,
): ChannelRateLimits {
  const rl = configService.get('rateLimit', { infer: true });
  return {
    email: rl.email,
    sms: rl.sms,
    push: rl.push,
    whatsapp: rl.whatsapp,
    in_app: rl.inApp,
  };
}
