"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const config_1 = require("@nestjs/config");
const queue_service_1 = require("./queue.service");
const notification_processor_1 = require("./notification.processor");
const rate_limit_module_1 = require("../rate-limit/rate-limit.module");
const templates_module_1 = require("../templates/templates.module");
const dispatcher_module_1 = require("../dispatcher/dispatcher.module");
const delivery_log_module_1 = require("../delivery-log/delivery-log.module");
const nestjs_1 = require("@bull-board/nestjs");
const express_1 = require("@bull-board/express");
const bullMQAdapter_1 = require("@bull-board/api/bullMQAdapter");
let QueueModule = class QueueModule {
};
exports.QueueModule = QueueModule;
exports.QueueModule = QueueModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => {
                    const redis = configService.get('redis', { infer: true });
                    return {
                        connection: {
                            host: redis.host,
                            port: redis.port,
                        },
                    };
                },
                inject: [config_1.ConfigService],
            }),
            bullmq_1.BullModule.registerQueue({
                name: 'notifications',
                defaultJobOptions: {
                    attempts: 5,
                    backoff: {
                        type: 'exponential',
                        delay: 3000,
                    },
                    removeOnComplete: { count: 1000 },
                    removeOnFail: { count: 5000 },
                },
            }, {
                name: 'notifications-dlq',
            }),
            nestjs_1.BullBoardModule.forRoot({
                route: '/admin/queues',
                adapter: express_1.ExpressAdapter,
            }),
            nestjs_1.BullBoardModule.forFeature({
                name: 'notifications',
                adapter: bullMQAdapter_1.BullMQAdapter,
            }, {
                name: 'notifications-dlq',
                adapter: bullMQAdapter_1.BullMQAdapter,
            }),
            rate_limit_module_1.RateLimitModule,
            templates_module_1.TemplatesModule,
            dispatcher_module_1.DispatcherModule,
            delivery_log_module_1.DeliveryLogModule,
        ],
        providers: [queue_service_1.QueueService, notification_processor_1.NotificationProcessor],
        exports: [queue_service_1.QueueService],
    })
], QueueModule);
//# sourceMappingURL=queue.module.js.map