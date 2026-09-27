import { describe, expect, it } from 'vitest';
import { loadEnv } from './env.js';

const base = {
  DATABASE_URL: 'postgresql://user:password@db:5432/app',
  NODE_ENV: 'production',
  CORS_ORIGINS: 'https://example.com',
  ADMIN_ORIGINS: 'https://example.com',
  ADMIN_COOKIE_SECURE: 'true',
} as const;
describe('production environment validation', () => {
  it('accepts disabled providers without provider secrets', () => {
    const env = loadEnv(base);
    expect(env.PAYMENT_PROVIDER).toBe('disabled');
    expect(env.SMS_PROVIDER).toBe('disabled');
  });
  it('rejects insecure admin cookies', () =>
    expect(() => loadEnv({ ...base, ADMIN_COOKIE_SECURE: 'false' })).toThrow(
      /ADMIN_COOKIE_SECURE/,
    ));
  it('rejects non-HTTPS production origins', () =>
    expect(() =>
      loadEnv({ ...base, CORS_ORIGINS: 'http://example.com' }),
    ).toThrow(/HTTPS/));
  it('requires an HTTPS callback when payment is configured', () =>
    expect(() =>
      loadEnv({
        ...base,
        PAYMENT_PROVIDER_CONFIGURED: 'true',
        PAYMENT_CALLBACK_BASE_URL: 'http://api.example.com',
      }),
    ).toThrow(/callback/));
});
