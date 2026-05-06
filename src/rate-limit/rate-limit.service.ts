// src/rate-limit/rate-limit.service.ts

import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { AppConfig } from '../config/configuration';
import { buildRateLimitConfig, ChannelRateLimits } from './rate-limit.config';

/**
 * Sliding-window rate limiter using Redis sorted sets.
 *
 * Key: rate:{userId}:{channel}
 * The Lua script:
 *   1. Removes all entries older than the current window (1 hour)
 *   2. Counts remaining entries
 *   3. If count < limit → adds current timestamp and returns 1 (allowed)
 *   4. Otherwise → returns 0 (denied)
 */
const SLIDING_WINDOW_LUA = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])

local cutoff = now - window

redis.call('ZREMRANGEBYSCORE', key, '-inf', cutoff)
local count = redis.call('ZCARD', key)

if count < limit then
  redis.call('ZADD', key, now, now .. '-' .. math.random(1, 1000000))
  redis.call('PEXPIRE', key, window)
  return 1
else
  return 0
end
`;

const WINDOW_MS = 60 * 60 * 1000; // 1 hour in milliseconds

@Injectable()
export class RateLimitService implements OnModuleDestroy {
  private readonly logger = new Logger(RateLimitService.name);
  private readonly redis: Redis;
  private readonly limits: ChannelRateLimits;

  constructor(private readonly configService: ConfigService<AppConfig, true>) {
    const redisConfig = this.configService.get('redis', { infer: true });
    this.redis = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      lazyConnect: true,
      ...(redisConfig.tls ? { tls: {} } : {}),
    });
    this.limits = buildRateLimitConfig(this.configService);
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }

  /**
   * Returns true if the request is within rate limits, false if rate-limited.
   */
  async allow(userId: string, channel: string): Promise<boolean> {
    const limit = this.getLimitForChannel(channel);
    const key = `rate:${userId}:${channel}`;
    const now = Date.now();

    const result = await this.redis.eval(
      SLIDING_WINDOW_LUA,
      1,
      key,
      now.toString(),
      WINDOW_MS.toString(),
      limit.toString(),
    );

    const allowed = result === 1;

    if (!allowed) {
      this.logger.warn(`Rate limit exceeded: user=${userId}, channel=${channel}, limit=${limit}`);
    }

    return allowed;
  }

  private getLimitForChannel(channel: string): number {
    const key = channel as keyof ChannelRateLimits;
    return this.limits[key] ?? 10;
  }
}
