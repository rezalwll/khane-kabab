import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import type pino from 'pino';
import type { AppDb } from './db/client.js';
import type { Env } from './config/env.js';
import { couponRoutes } from './modules/coupons/routes.js';
import { healthRoutes } from './modules/health/routes.js';
import { menuRoutes } from './modules/menu/routes.js';
import { orderRoutes } from './modules/orders/routes.js';
import { productRoutes } from './modules/products/routes.js';
import { restaurantRoutes } from './modules/restaurant/routes.js';
import { adminAuthRoutes } from './modules/admin/auth-routes.js';
import { adminCatalogRoutes } from './modules/admin/catalog-routes.js';
import { adminDashboardRoutes } from './modules/admin/dashboard-routes.js';
import { adminOrderRoutes } from './modules/admin/order-routes.js';
import {
  adminOpeningHoursRoutes,
  adminSettingsRoutes,
} from './modules/admin/settings-routes.js';
import { adminOriginGuard, requireAdmin } from './modules/admin/middleware.js';
import { errorHandler } from './middleware/error-handler.js';
import { loggerMiddleware } from './middleware/logger.js';
import {
  requestIdMiddleware,
  type AppVariables,
} from './middleware/request-id.js';

export function createApp({
  db,
  env,
  logger,
}: {
  db: AppDb;
  env: Env;
  logger: pino.Logger;
}) {
  const app = new Hono<{ Variables: AppVariables }>();
  app.use('*', requestIdMiddleware);
  app.use('*', loggerMiddleware(logger));
  app.use('/api/*', secureHeaders());
  app.use(
    '/api/v1/admin/*',
    cors({
      origin: (origin) =>
        env.adminOrigins.includes(origin) ? origin : undefined,
      allowHeaders: ['Content-Type', 'X-Request-Id'],
      allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'OPTIONS'],
      exposeHeaders: ['X-Request-Id'],
      credentials: true,
      maxAge: 600,
    }),
  );
  app.use('/api/v1/admin/*', adminOriginGuard(env));
  app.use('/api/*', async (c, next) => {
    if (c.req.path.startsWith('/api/v1/admin/')) return next();
    return cors({
      origin: (origin) =>
        env.corsOrigins.includes(origin) ? origin : undefined,
      allowHeaders: ['Content-Type', 'X-Order-Token', 'X-Request-Id'],
      allowMethods: ['GET', 'POST', 'OPTIONS'],
      exposeHeaders: ['X-Request-Id'],
      maxAge: 600,
    })(c, next);
  });
  app.route('/health', healthRoutes);
  app.route('/api/v1/menu', menuRoutes(db));
  app.route('/api/v1/products', productRoutes(db));
  app.route('/api/v1/coupons', couponRoutes(db));
  app.route('/api/v1/orders', orderRoutes(db));
  app.route('/api/v1/restaurant', restaurantRoutes(db));
  app.route('/api/v1/admin/auth', adminAuthRoutes(db, env));
  app.use('/api/v1/admin/dashboard/*', requireAdmin(db));
  app.route('/api/v1/admin/dashboard', adminDashboardRoutes(db));
  app.use('/api/v1/admin/orders/*', requireAdmin(db));
  app.route('/api/v1/admin/orders', adminOrderRoutes(db));
  app.use('/api/v1/admin/menu', requireAdmin(db));
  app.use('/api/v1/admin/categories/*', requireAdmin(db));
  app.use('/api/v1/admin/products/*', requireAdmin(db));
  app.use('/api/v1/admin/option-groups/*', requireAdmin(db));
  app.use('/api/v1/admin/options/*', requireAdmin(db));
  app.route('/api/v1/admin', adminCatalogRoutes(db));
  app.use('/api/v1/admin/settings/*', requireAdmin(db));
  app.route('/api/v1/admin/settings', adminSettingsRoutes(db));
  app.use('/api/v1/admin/opening-hours/*', requireAdmin(db));
  app.route('/api/v1/admin/opening-hours', adminOpeningHoursRoutes(db));
  app.notFound((c) =>
    c.json(
      {
        error: {
          code: 'NOT_FOUND',
          message: 'مسیر درخواستی پیدا نشد.',
          requestId: c.get('requestId'),
        },
      },
      404,
    ),
  );
  app.onError(errorHandler(logger));
  return app;
}
