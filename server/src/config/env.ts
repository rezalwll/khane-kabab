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
  return { ...parsed, corsOrigins, adminOrigins };
}
