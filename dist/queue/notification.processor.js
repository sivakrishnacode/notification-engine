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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const bullmq_2 = require("bullmq");
const notification_job_dto_1 = require("../common/dto/notification-job.dto");
const rate_limit_service_1 = require("../rate-limit/rate-limit.service");
const templates_service_1 = require("../templates/templates.service");
const dispatcher_service_1 = require("../dispatcher/dispatcher.service");
const delivery_log_service_1 = require("../delivery-log/delivery-log.service");
let NotificationProcessor = NotificationProcessor_1 = class NotificationProcessor extends bullmq_1.WorkerHost {
    constructor(rateLimit, templates, dispatcher, deliveryLog, dlqQueue) {
        super();
        this.rateLimit = rateLimit;
        this.templates = templates;
        this.dispatcher = dispatcher;
        this.deliveryLog = deliveryLog;
        this.dlqQueue = dlqQueue;
        this.logger = new common_1.Logger(NotificationProcessor_1.name);
    }
    async process(job) {
        const { id, data: rawData } = job;
        this.logger.debug(`Processing notification job: ${id}`);
        const validationResult = notification_job_dto_1.NotificationJobSchema.safeParse(rawData);
        if (!validationResult.success) {
            this.logger.error(`Invalid job payload for job ${id}: ${JSON.stringify(validationResult.error.errors)}`);
            throw new bullmq_2.UnrecoverableError('Invalid notification job payload');
        }
        const notificationJob = validationResult.data;
        if (!notificationJob.jobId) {
            notificationJob.jobId = String(id);
        }
        const { userId, channel, templateId, data } = notificationJob;
        try {
            const isRateLimited = !(await this.rateLimit.allow(userId, channel));
            if (isRateLimited) {
                await this.deliveryLog.write({
                    jobId: id,
                    userId,
                    channel,
                    status: 'RATE_LIMITED',
                });
                throw new Error(`Rate limit exceeded for user ${userId} on channel ${channel}`);
            }
            let rendered;
            if (notificationJob.templateId) {
                rendered = await this.templates.render(notificationJob.templateId, channel, data || {});
            }
            else if (notificationJob.content) {
                rendered = {
                    subject: notificationJob.content.subject,
                    body: notificationJob.content.body,
                    htmlBody: notificationJob.content.htmlBody,
                };
            }
            else {
                throw new bullmq_2.UnrecoverableError('Internal logic error: neither templateId nor content provided after validation');
            }
            const result = await this.dispatcher.send(notificationJob, rendered);
            if (channel !== 'in_app') {
                await this.deliveryLog.write({
                    jobId: id,
                    userId,
                    channel,
                    status: 'DELIVERED',
                    providerRef: result.providerRef,
                });
            }
            this.logger.log(`Notification delivered: job=${id}, channel=${channel}, user=${userId}, ref=${result.providerRef}`);
        }
        catch (error) {
            if (error instanceof bullmq_2.UnrecoverableError)
                throw error;
            this.logger.error(`Job ${id} failed: ${error.message}`);
            await this.deliveryLog.write({
                jobId: id,
                userId,
                channel,
                status: 'FAILED',
                error: error.message,
            });
            throw error;
        }
    }
    async onFailed(job, error) {
        this.logger.error(`Job ${job.id} failed event: ${error.message}`);
        const maxAttempts = job.opts.attempts || 5;
        if (job.attemptsMade >= maxAttempts) {
            this.logger.warn(`Moving job ${job.id} to DLQ`);
            await this.dlqQueue.add(job.name, job.data, {
                jobId: `dlq-${job.id}`,
                removeOnComplete: true,
            });
        }
    }
};
exports.NotificationProcessor = NotificationProcessor;
__decorate([
    (0, bullmq_1.OnWorkerEvent)('failed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job, Error]),
    __metadata("design:returntype", Promise)
], NotificationProcessor.prototype, "onFailed", null);
exports.NotificationProcessor = NotificationProcessor = NotificationProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('notifications', {
        concurrency: parseInt(process.env['WORKER_CONCURRENCY'] || '5', 10),
    }),
    __param(4, (0, bullmq_1.InjectQueue)('notifications-dlq')),
    __metadata("design:paramtypes", [rate_limit_service_1.RateLimitService,
        templates_service_1.TemplatesService,
        dispatcher_service_1.DispatcherService,
        delivery_log_service_1.DeliveryLogService,
        bullmq_2.Queue])
], NotificationProcessor);
//# sourceMappingURL=notification.processor.js.map