"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProvidersModule = void 0;
const common_1 = require("@nestjs/common");
const email_provider_1 = require("./email/email.provider");
const sms_provider_1 = require("./sms/sms.provider");
const push_provider_1 = require("./push/push.provider");
const whatsapp_provider_1 = require("./whatsapp/whatsapp.provider");
const in_app_provider_1 = require("./in-app/in-app.provider");
const websocket_module_1 = require("../websocket/websocket.module");
let ProvidersModule = class ProvidersModule {
};
exports.ProvidersModule = ProvidersModule;
exports.ProvidersModule = ProvidersModule = __decorate([
    (0, common_1.Module)({
        imports: [websocket_module_1.WebsocketModule],
        providers: [
            email_provider_1.EmailProvider,
            sms_provider_1.SmsProvider,
            push_provider_1.PushProvider,
            whatsapp_provider_1.WhatsappProvider,
            in_app_provider_1.InAppProvider,
        ],
        exports: [
            email_provider_1.EmailProvider,
            sms_provider_1.SmsProvider,
            push_provider_1.PushProvider,
            whatsapp_provider_1.WhatsappProvider,
            in_app_provider_1.InAppProvider,
        ],
    })
], ProvidersModule);
//# sourceMappingURL=providers.module.js.map