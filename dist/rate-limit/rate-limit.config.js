"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRateLimitConfig = buildRateLimitConfig;
function buildRateLimitConfig(configService) {
    const rl = configService.get('rateLimit', { infer: true });
    return {
        email: rl.email,
        sms: rl.sms,
        push: rl.push,
        whatsapp: rl.whatsapp,
        in_app: rl.inApp,
    };
}
//# sourceMappingURL=rate-limit.config.js.map