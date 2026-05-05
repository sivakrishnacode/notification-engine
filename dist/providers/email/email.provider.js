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
var EmailProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_ses_1 = require("@aws-sdk/client-ses");
let EmailProvider = EmailProvider_1 = class EmailProvider {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(EmailProvider_1.name);
        const aws = this.configService.get('aws', { infer: true });
        this.sesClient = new client_ses_1.SESClient({
            region: aws.region,
            credentials: {
                accessKeyId: aws.accessKeyId,
                secretAccessKey: aws.secretAccessKey,
            },
        });
        this.fromAddress = aws.sesFromAddress;
    }
    async send(job, rendered) {
        const toAddress = job.recipient.email;
        if (!toAddress) {
            throw new Error(`Email provider: no recipient.email in job ${job.jobId}`);
        }
        const input = {
            Source: this.fromAddress,
            Destination: {
                ToAddresses: [toAddress],
            },
            Message: {
                Subject: {
                    Data: rendered.subject ?? '(no subject)',
                    Charset: 'UTF-8',
                },
                Body: {
                    Text: {
                        Data: rendered.body,
                        Charset: 'UTF-8',
                    },
                    ...(rendered.htmlBody
                        ? {
                            Html: {
                                Data: rendered.htmlBody,
                                Charset: 'UTF-8',
                            },
                        }
                        : {}),
                },
            },
        };
        const command = new client_ses_1.SendEmailCommand(input);
        const response = await this.sesClient.send(command);
        const messageId = response.MessageId ?? 'unknown';
        this.logger.log(`Email sent via SES: job=${job.jobId}, to=${toAddress}, id=${messageId}`);
        return { providerRef: messageId };
    }
};
exports.EmailProvider = EmailProvider;
exports.EmailProvider = EmailProvider = EmailProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailProvider);
//# sourceMappingURL=email.provider.js.map