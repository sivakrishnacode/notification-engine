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
var WhatsappProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
let WhatsappProvider = WhatsappProvider_1 = class WhatsappProvider {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(WhatsappProvider_1.name);
        const meta = this.configService.get('meta', { infer: true });
        this.phoneNumberId = meta.phoneNumberId;
        this.accessToken = meta.accessToken;
        this.baseUrl = `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`;
    }
    async send(job, rendered) {
        const waId = job.recipient.waId;
        if (!waId) {
            throw new Error(`WhatsApp provider: no recipient.waId in job ${job.jobId}`);
        }
        this.logger.debug(`Sending WhatsApp message: job=${job.jobId}, waId=${waId}`);
        try {
            const response = await axios_1.default.post(this.baseUrl, {
                messaging_product: 'whatsapp',
                to: waId,
                type: 'text',
                text: { body: rendered.body },
            }, {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            const providerRef = response.data.messages[0].id;
            this.logger.log(`WhatsApp message sent successfully: job=${job.jobId}, waId=${waId}, providerRef=${providerRef}`);
            return { providerRef };
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                this.logger.error(`Failed to send WhatsApp message for job ${job.jobId}: ${JSON.stringify(error.response?.data || error.message)}`);
            }
            throw error;
        }
    }
};
exports.WhatsappProvider = WhatsappProvider;
exports.WhatsappProvider = WhatsappProvider = WhatsappProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], WhatsappProvider);
//# sourceMappingURL=whatsapp.provider.js.map