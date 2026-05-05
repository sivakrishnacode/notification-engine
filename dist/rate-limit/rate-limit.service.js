"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RateLimitService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
const rate_limit_config_1 = require("./rate-limit.config");
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
const WINDOW_MS = 60 * 60 * 1000;
let RateLimitService = RateLimitService_1 = class RateLimitService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(RateLimitService_1.name);
        const redisConfig = this.configService.get('redis', { infer: true });
        this.redis = new ioredis_1.default({
            host: redisConfig.host,
            port: redisConfig.port,
            lazyConnect: true,
        });
        this.limits = (0, rate_limit_config_1.buildRateLimitConfig)(this.configService);
    }
    async onModuleDestroy() {
        await this.redis.quit();
    }
    async allow(userId, channel) {
        const limit = this.getLimitForChannel(channel);
        const key = `rate:${userId}:${channel}`;
        const now = Date.now();
        const result = await this.redis.eval(SLIDING_WINDOW_LUA, 1, key, now.toString(), WINDOW_MS.toString(), limit.toString());
        const allowed = result === 1;
        if (!allowed) {
            this.logger.warn(`Rate limit exceeded: user=${userId}, channel=${channel}, limit=${limit}`);
        }
        return allowed;
    }
    getLimitForChannel(channel) {
        const key = channel;
        return this.limits[key] ?? 10;
    }
};
exports.RateLimitService = RateLimitService;
exports.RateLimitService = RateLimitService = RateLimitService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RateLimitService);
//# sourceMappingURL=rate-limit.service.js.map