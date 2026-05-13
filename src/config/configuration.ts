// src/config/configuration.ts

export interface ServerConfig {
  firebase: {
    projectId: string;
    privateKey: string;
    clientEmail: string;
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
}

export interface AppConfig {
  nodeEnv: string;
  port: number;
  redis: {
    url: string;
  };
  database: {
    url: string;
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
  servers: {
    GAMERZ_BANK: ServerConfig;
    SPACE_SOLAR: ServerConfig;
  };
}

const getServerConfig = (prefix: string): ServerConfig => ({
  firebase: {
    projectId: process.env[`${prefix}_FIREBASE_PROJECT_ID`] ?? process.env['FIREBASE_PROJECT_ID'] ?? '',
    privateKey: process.env[`${prefix}_FIREBASE_PRIVATE_KEY`] ?? process.env['FIREBASE_PRIVATE_KEY'] ?? '',
    clientEmail: process.env[`${prefix}_FIREBASE_CLIENT_EMAIL`] ?? process.env['FIREBASE_CLIENT_EMAIL'] ?? '',
  },
  aws: {
    region: process.env[`${prefix}_AWS_REGION`] ?? process.env['AWS_REGION'] ?? '',
    accessKeyId: process.env[`${prefix}_AWS_ACCESS_KEY_ID`] ?? process.env['AWS_ACCESS_KEY_ID'] ?? '',
    secretAccessKey: process.env[`${prefix}_AWS_SECRET_ACCESS_KEY`] ?? process.env['AWS_SECRET_ACCESS_KEY'] ?? '',
    sesFromAddress: process.env[`${prefix}_SES_FROM_ADDRESS`] ?? process.env['SES_FROM_ADDRESS'] ?? '',
  },
  meta: {
    phoneNumberId: process.env[`${prefix}_META_PHONE_NUMBER_ID`] ?? process.env['META_PHONE_NUMBER_ID'] ?? '',
    accessToken: process.env[`${prefix}_META_ACCESS_TOKEN`] ?? process.env['META_ACCESS_TOKEN'] ?? '',
  },
  conceps: {
    token: process.env[`${prefix}_CONCEPS_TOKEN`] ?? process.env['CONCEPS_TOKEN'] ?? '',
  },
});

export default (): AppConfig => ({
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  redis: {
    url: process.env['REDIS_URL'] ?? 'redis://localhost:6379',
  },
  database: {
    url: process.env['DATABASE_URL'] ?? '',
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
  servers: {
    GAMERZ_BANK: getServerConfig('GAMERZ_BANK'),
    SPACE_SOLAR: getServerConfig('SPACE_SOLAR'),
  },
});
