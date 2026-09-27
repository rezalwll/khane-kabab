import { Hono } from 'hono';
import type { AppDb } from '../../db/client.js';
import type { Env } from '../../config/env.js';
import { ApiError } from '../../lib/errors.js';
import { processRateLimit } from '../../middleware/rate-limit.js';
import { startPayment } from './service.js';
import type pino from 'pino';
import { reportUnexpectedError } from '../../lib/report-error.js';
import type { AppVariables } from '../../middleware/request-id.js';
export function paymentRoutes(db: AppDb, env: Env, logger: pino.Logger) {
  const app = new Hono<{ Variables: AppVariables }>();
  app.post(
    '/:publicNumber/start',
    processRateLimit('payment-start', 10, 60_000),
    async (c) => {
      try {
        return c.json(
          await startPayment(
            db,
            env,
            c.req.param('publicNumber'),
            c.req.header('x-order-token'),
          ),
          201,
        );
      } catch (error) {
        reportUnexpectedError(logger, error, {
          area: 'payment-start',
          requestId: c.get('requestId'),
          publicNumber: c.req.param('publicNumber'),
        });
        throw error;
      }
    },
  );
  app.all('/callback/:provider', () => {
    throw new ApiError(
      503,
      'PAYMENT_PROVIDER_NOT_CONFIGURED',
      'تایید پرداخت برای این provider پیاده‌سازی نشده است.',
    );
  });
  return app;
}
