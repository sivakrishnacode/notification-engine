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
var InAppProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InAppProvider = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const notification_gateway_1 = require("../../websocket/notification.gateway");
let InAppProvider = InAppProvider_1 = class InAppProvider {
    constructor(prisma, gateway) {
        this.prisma = prisma;
        this.gateway = gateway;
        this.logger = new common_1.Logger(InAppProvider_1.name);
    }
    async send(job, rendered) {
        this.logger.debug(`Saving in-app notification: job=${job.jobId}, user=${job.userId}`);
        const log = await this.prisma.deliveryLog.create({
            data: {
                jobId: job.jobId,
                userId: job.userId,
                channel: 'in_app',
                status: 'DELIVERED',
                metadata: {
                    subject: rendered.subject,
                    body: rendered.body,
                    htmlBody: rendered.htmlBody,
                    ...(job.metadata || {}),
                },
            },
        });
        this.gateway.emitToUser(job.userId, {
            id: log.id,
            jobId: job.jobId,
            subject: rendered.subject,
            body: rendered.body,
            createdAt: log.createdAt,
        });
        this.logger.log({ jobId: job.jobId, userId: job.userId, logId: log.id }, 'In-app notification delivered and emitted');
        return { providerRef: log.id };
    }
};
exports.InAppProvider = InAppProvider;
exports.InAppProvider = InAppProvider = InAppProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notification_gateway_1.NotificationGateway])
], InAppProvider);
//# sourceMappingURL=in-app.provider.js.map