"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_module_1 = require("./config/config.module");
const prisma_module_1 = require("./prisma/prisma.module");
const queue_module_1 = require("./queue/queue.module");
const dispatcher_module_1 = require("./dispatcher/dispatcher.module");
const providers_module_1 = require("./providers/providers.module");
const templates_module_1 = require("./templates/templates.module");
const rate_limit_module_1 = require("./rate-limit/rate-limit.module");
const delivery_log_module_1 = require("./delivery-log/delivery-log.module");
const websocket_module_1 = require("./websocket/websocket.module");
const health_module_1 = require("./health/health.module");
const auth_module_1 = require("./auth/auth.module");
const notifications_module_1 = require("./notifications/notifications.module");
const app_controller_1 = require("./app.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_module_1.AppConfigModule,
            prisma_module_1.PrismaModule,
            queue_module_1.QueueModule,
            dispatcher_module_1.DispatcherModule,
            providers_module_1.ProvidersModule,
            templates_module_1.TemplatesModule,
            rate_limit_module_1.RateLimitModule,
            delivery_log_module_1.DeliveryLogModule,
            websocket_module_1.WebsocketModule,
            health_module_1.HealthModule,
            auth_module_1.AuthModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [app_controller_1.AppController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map