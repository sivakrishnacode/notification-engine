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
var DispatcherService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DispatcherService = void 0;
const common_1 = require("@nestjs/common");
const email_provider_1 = require("../providers/email/email.provider");
const sms_provider_1 = require("../providers/sms/sms.provider");
const push_provider_1 = require("../providers/push/push.provider");
const whatsapp_provider_1 = require("../providers/whatsapp/whatsapp.provider");
const in_app_provider_1 = require("../providers/in-app/in-app.provider");
let DispatcherService = DispatcherService_1 = class DispatcherService {
    constructor(emailProvider, smsProvider, pushProvider, whatsappProvider, inAppProvider) {
        this.emailProvider = emailProvider;
        this.smsProvider = smsProvider;
        this.pushProvider = pushProvider;
        this.whatsappProvider = whatsappProvider;
        this.inAppProvider = inAppProvider;
        this.logger = new common_1.Logger(DispatcherService_1.name);
        this.strategies = new Map([
            ['email', this.emailProvider],
            ['sms', this.smsProvider],
            ['push', this.pushProvider],
            ['whatsapp', this.whatsappProvider],
            ['in_app', this.inAppProvider],
        ]);
    }
    async send(job, rendered) {
        const strategy = this.strategies.get(job.channel);
        if (!strategy) {
            this.logger.error(`No strategy found for channel: ${job.channel}`);
            throw new Error(`Unsupported channel: ${job.channel}`);
        }
        this.logger.debug(`Routing job ${job.jobId} to provider for channel ${job.channel}`);
        return strategy.send(job, rendered);
    }
};
exports.DispatcherService = DispatcherService;
exports.DispatcherService = DispatcherService = DispatcherService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [email_provider_1.EmailProvider,
        sms_provider_1.SmsProvider,
        push_provider_1.PushProvider,
        whatsapp_provider_1.WhatsappProvider,
        in_app_provider_1.InAppProvider])
], DispatcherService);
//# sourceMappingURL=dispatcher.service.js.map