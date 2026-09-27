import { Hono } from 'hono';
import type { AppDb } from '../../db/client.js';
import type { Env } from '../../config/env.js';
import { ApiError } from '../../lib/errors.js';
import { processRateLimit } from '../../middleware/rate-limit.js';
import { createOrderSchema, pricingRequestSchema } from './input.js';
import { createOrder, getOrder, quoteOrder } from './service.js';
export function orderRoutes(db: AppDb, env: Env) {
  const app = new Hono();
  app.post('/quote', processRateLimit('quote', 60, 60_000), async (c) => {
    const parsed = pricingRequestSchema.safeParse(
      await c.req.json().catch(() => null),
    );
    if (!parsed.success)
      throw new ApiError(
        422,
        'VALIDATION_ERROR',
        parsed.error.issues[0]?.message ?? 'اطلاعات سفارش معتبر نیست.',
      );
    return c.json(await quoteOrder(db, parsed.data));
  });
  app.post('/', processRateLimit('order-create', 12, 60_000), async (c) => {
    const parsed = createOrderSchema.safeParse(
      await c.req.json().catch(() => null),
    );
    if (!parsed.success)
      throw new ApiError(
        422,
        'VALIDATION_ERROR',
        parsed.error.issues[0]?.message ?? 'اطلاعات سفارش معتبر نیست.',
      );
    const order = await createOrder(db, env, parsed.data);
    return c.json(order, order.duplicate ? 200 : 201);
  });
  app.get('/:publicNumber', async (c) =>
    c.json(
      await getOrder(
        db,
        c.req.param('publicNumber'),
        c.req.header('x-order-token'),
      ),
    ),
  );
  return app;
}
