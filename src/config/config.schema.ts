// src/config/config.schema.ts

import * as Joi from 'joi';

export const configSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),

  // Redis
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),

  // PostgreSQL
  DATABASE_URL: Joi.string().required(),

  // AWS
  AWS_REGION: Joi.string().required(),
  AWS_ACCESS_KEY_ID: Joi.string().required(),
  AWS_SECRET_ACCESS_KEY: Joi.string().required(),
  SES_FROM_ADDRESS: Joi.string().email().required(),

  // Meta / WhatsApp
  META_PHONE_NUMBER_ID: Joi.string().required(),
  META_ACCESS_TOKEN: Joi.string().allow('').optional(),

  // Conceps / WhatsApp
  CONCEPS_TOKEN: Joi.string().allow('').optional(),
  WHATSAPP_PROVIDER: Joi.string().valid('meta', 'conceps').default('meta'),

  // Worker
  WORKER_CONCURRENCY: Joi.number().integer().min(1).default(5),

  // Rate limits (per hour)
  RATE_LIMIT_EMAIL: Joi.number().integer().min(1).default(10),
  RATE_LIMIT_SMS: Joi.number().integer().min(1).default(3),
  RATE_LIMIT_PUSH: Joi.number().integer().min(1).default(20),
  RATE_LIMIT_WHATSAPP: Joi.number().integer().min(1).default(5),
  RATE_LIMIT_IN_APP: Joi.number().integer().min(1).default(100),

  // Auth
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION: Joi.string().default('3600s'),
});
