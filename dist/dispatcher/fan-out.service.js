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
var FanOutService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FanOutService = void 0;
const common_1 = require("@nestjs/common");
const queue_service_1 = require("../queue/queue.service");
const crypto_1 = require("crypto");
let FanOutService = FanOutService_1 = class FanOutService {
    constructor(queueService) {
        this.queueService = queueService;
        this.logger = new common_1.Logger(FanOutService_1.name);
    }
    async send(request) {
        const { channels, userId, templateId, content, data, recipient, priority, metadata } = request;
        const jobIds = [];
        this.logger.log(`Fanning out notification for user ${userId} to ${channels.length} channels: ${channels.join(', ')}`);
        for (const channel of channels) {
            const jobId = (0, crypto_1.randomUUID)();
            const job = {
                jobId,
                userId,
                channel,
                templateId,
                content,
                data,
                recipient,
                priority,
                metadata: {
                    ...metadata,
                    fanOutId: jobId,
                },
            };
            await this.queueService.enqueue(job);
            jobIds.push(jobId);
        }
        return { jobIds };
    }
};
exports.FanOutService = FanOutService;
exports.FanOutService = FanOutService = FanOutService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [queue_service_1.QueueService])
], FanOutService);
//# sourceMappingURL=fan-out.service.js.map