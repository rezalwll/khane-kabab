import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  ADMIN_ORIGINS: z.string().default('http://localhost:3000'),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
  ADMIN_SESSION_TTL_HOURS: z.coerce.number().int().min(1).max(168).default(12),
  ADMIN_COOKIE_SECURE: z
    .string()
    .default('false')
    .transform((value) => value === 'true'),
  ADMIN_COOKIE_DOMAIN: z.string().default(''),
  ADMIN_BOOTSTRAP_USERNAME: z.string().optional(),
  ADMIN_BOOTSTRAP_PASSWORD: z.string().optional(),
  ADMIN_BOOTSTRAP_DISPLAY_NAME: z.string().default('مدیر خانه کباب'),
  PAYMENT_PROVIDER: z.string().default('disabled'),
  PAYMENT_CALLBACK_BASE_URL: z.string().default(''),
  PAYMENT_PROVIDER_CONFIGURED: z
    .string()
    .default('false')
    .transform((value) => value === 'true'),
  SMS_PROVIDER: z.string().default('disabled'),
  SMS_PROVIDER_CONFIGURED: z
    .string()
    .default('false')
    .transform((value) => value === 'true'),
  APP_VERSION: z.string().default('development'),
  GIT_SHA: z.string().default('unknown'),
  DB_POOL_MAX: z.coerce.number().int().min(1).max(50).default(10),
  DB_IDLE_TIMEOUT_MS: z.coerce.number().int().min(1000).default(30_000),
  DB_CONNECTION_TIMEOUT_MS: z.coerce.number().int().min(1000).default(5_000),
  DATABASE_SSL_MODE: z.enum(['disable', 'require']).default('disable'),
  ALLOW_SEED_OVERWRITE: z
    .string()
    .default('false')
    .transform((value) => value === 'true'),
  NOTIFICATION_RETENTION_DAYS: z.coerce.number().int().min(1).default(90),
});

export type Env = z.infer<typeof envSchema> & {
  corsOrigins: string[];
  adminOrigins: string[];
};

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = envSchema.parse(source);
  const corsOrigins = parsed.CORS_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const adminOrigins = parsed.ADMIN_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (corsOrigins.includes('*') || adminOrigins.includes('*'))
    throw new Error('CORS origins cannot contain *');
  if (parsed.NODE_ENV === 'production') {
    if (!parsed.ADMIN_COOKIE_SECURE)
      throw new Error('ADMIN_COOKIE_SECURE must be true in production');
    if (!corsOrigins.length || !adminOrigins.length)
      throw new Error('Production CORS origins must be explicit');
    for (const origin of [...corsOrigins, ...adminOrigins])
      if (!origin.startsWith('https://'))
        throw new Error('Production origins must use HTTPS');
    if (
      parsed.PAYMENT_PROVIDER_CONFIGURED &&
      !parsed.PAYMENT_CALLBACK_BASE_URL.startsWith('https://')
    )
      throw new Error('Configured payment requires an HTTPS callback URL');
  }
  return { ...parsed, corsOrigins, adminOrigins };
}
