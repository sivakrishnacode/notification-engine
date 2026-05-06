// src/config/configuration.ts

export interface AppConfig {
  nodeEnv: string;
  port: number;
  redis: {
    host: string;
    port: number;
    tls: boolean;
    password?: string;
  };
  database: {
    url: string;
  };
  aws: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    sesFromAddress: string;
  };
  meta: {
    phoneNumberId: string;
    accessToken: string;
  };
  conceps: {
    token: string;
  };
  whatsappProvider: 'meta' | 'conceps';
  worker: {
    concurrency: number;
  };
  rateLimit: {
    email: number;
    sms: number;
    push: number;
    whatsapp: number;
    inApp: number;
  };
  auth: {
    jwtSecret: string;
    jwtExpiration: string;
  };
}

export default (): AppConfig => ({
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  redis: {
    host: process.env['REDIS_HOST'] ?? 'localhost',
    port: parseInt(process.env['REDIS_PORT'] ?? '6379', 10),
    tls: process.env['REDIS_TLS'] === 'true',
    password: process.env['REDIS_PASSWORD'],
  },
  database: {
    url: process.env['DATABASE_URL'] ?? '',
  },
  aws: {
    region: process.env['AWS_REGION'] ?? '',
    accessKeyId: process.env['AWS_ACCESS_KEY_ID'] ?? '',
    secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'] ?? '',
    sesFromAddress: process.env['SES_FROM_ADDRESS'] ?? '',
  },
  meta: {
    phoneNumberId: process.env['META_PHONE_NUMBER_ID'] ?? '',
    accessToken: process.env['META_ACCESS_TOKEN'] ?? '',
  },
  conceps: {
    token: process.env['CONCEPS_TOKEN'] ?? '',
  },
  whatsappProvider: (process.env['WHATSAPP_PROVIDER'] as any) ?? 'meta',
  worker: {
    concurrency: parseInt(process.env['WORKER_CONCURRENCY'] ?? '5', 10),
  },
  rateLimit: {
    email: parseInt(process.env['RATE_LIMIT_EMAIL'] ?? '10', 10),
    sms: parseInt(process.env['RATE_LIMIT_SMS'] ?? '3', 10),
    push: parseInt(process.env['RATE_LIMIT_PUSH'] ?? '20', 10),
    whatsapp: parseInt(process.env['RATE_LIMIT_WHATSAPP'] ?? '5', 10),
    inApp: parseInt(process.env['RATE_LIMIT_IN_APP'] ?? '100', 10),
  },
  auth: {
    jwtSecret: process.env['JWT_SECRET'] ?? '',
    jwtExpiration: process.env['JWT_EXPIRATION'] ?? '3600s',
  },
});
