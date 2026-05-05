"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.configSchema = void 0;
const Joi = __importStar(require("joi"));
exports.configSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),
    PORT: Joi.number().default(3000),
    REDIS_HOST: Joi.string().default('localhost'),
    REDIS_PORT: Joi.number().default(6379),
    DATABASE_URL: Joi.string().required(),
    AWS_REGION: Joi.string().required(),
    AWS_ACCESS_KEY_ID: Joi.string().required(),
    AWS_SECRET_ACCESS_KEY: Joi.string().required(),
    SES_FROM_ADDRESS: Joi.string().email().required(),
    META_PHONE_NUMBER_ID: Joi.string().required(),
    META_ACCESS_TOKEN: Joi.string().required(),
    WORKER_CONCURRENCY: Joi.number().integer().min(1).default(5),
    RATE_LIMIT_EMAIL: Joi.number().integer().min(1).default(10),
    RATE_LIMIT_SMS: Joi.number().integer().min(1).default(3),
    RATE_LIMIT_PUSH: Joi.number().integer().min(1).default(20),
    RATE_LIMIT_WHATSAPP: Joi.number().integer().min(1).default(5),
    RATE_LIMIT_IN_APP: Joi.number().integer().min(1).default(100),
    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRATION: Joi.string().default('3600s'),
});
//# sourceMappingURL=config.schema.js.map