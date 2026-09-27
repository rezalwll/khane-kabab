import { createMiddleware } from 'hono/factory';
import { ApiError } from '../lib/errors.js';
const buckets = new Map<string, { count: number; resetAt: number }>();
export function processRateLimit(
  name: string,
  limit: number,
  windowMs: number,
) {
  return createMiddleware(async (c, next) => {
    const now = Date.now();
    const ip = (
      c.req.header('x-forwarded-for')?.split(',')[0] ??
      c.req.header('cf-connecting-ip') ??
      'local'
    ).trim();
    const key = `${name}:${ip}`;
    const current = buckets.get(key);
    if (!current || current.resetAt <= now)
      buckets.set(key, { count: 1, resetAt: now + windowMs });
    else if (current.count >= limit)
      throw new ApiError(
        429,
        'RATE_LIMITED',
        'تعداد درخواست‌ها زیاد است؛ کمی بعد دوباره تلاش کنید.',
      );
    else current.count++;
    await next();
  });
}
