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
var SmsProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_sns_1 = require("@aws-sdk/client-sns");
let SmsProvider = SmsProvider_1 = class SmsProvider {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(SmsProvider_1.name);
        const aws = this.configService.get('aws', { infer: true });
        this.snsClient = new client_sns_1.SNSClient({
            region: aws.region,
            credentials: {
                accessKeyId: aws.accessKeyId,
                secretAccessKey: aws.secretAccessKey,
            },
        });
    }
    async send(job, rendered) {
        const phoneNumber = job.recipient.phone;
        if (!phoneNumber) {
            throw new Error(`SMS provider: no recipient.phone in job ${job.jobId}`);
        }
        const command = new client_sns_1.PublishCommand({
            PhoneNumber: phoneNumber,
            Message: rendered.body,
        });
        const response = await this.snsClient.send(command);
        const messageId = response.MessageId ?? 'unknown';
        this.logger.log(`SMS sent via SNS: job=${job.jobId}, phone=${phoneNumber}, id=${messageId}`);
        return { providerRef: messageId };
    }
};
exports.SmsProvider = SmsProvider;
exports.SmsProvider = SmsProvider = SmsProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SmsProvider);
//# sourceMappingURL=sms.provider.js.map