import { eq, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import type { Env } from '../../config/env.js';
import type { AppDb } from '../../db/client.js';
import {
  notificationOutbox,
  restaurantSettings,
  serviceHeartbeats,
} from '../../db/schema.js';
import type { AppVariables } from '../../middleware/request-id.js';
import { getNotificationCapability } from '../notifications/service.js';
import { getPaymentCapability } from '../payments/service.js';
import { requirePermission } from './middleware.js';
import type { AdminVariables } from './types.js';

export function adminSystemRoutes(db: AppDb, env: Env) {
  const app = new Hono<{ Variables: AppVariables & AdminVariables }>();
  app.use('*', requirePermission('settings:read'));
  app.get('/', async (c) => {
    await db.execute(sql`select 1`);
    const [ordering] = await db
      .select({
        ordersEnabled: restaurantSettings.ordersEnabled,
        deliveryEnabled: restaurantSettings.deliveryEnabled,
        pickupEnabled: restaurantSettings.pickupEnabled,
      })
      .from(restaurantSettings)
      .limit(1);
    const [pending] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notificationOutbox)
      .where(eq(notificationOutbox.status, 'pending'));
    const [failed] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notificationOutbox)
      .where(eq(notificationOutbox.status, 'failed'));
    const [heartbeat] = await db
      .select()
      .from(serviceHeartbeats)
      .where(eq(serviceHeartbeats.serviceName, 'notification-worker'))
      .limit(1);
    const { settings: _settings, ...sms } = await getNotificationCapability(
      db,
      env,
    );
    return c.json({
      backend: {
        apiReachable: true,
        databaseReady: true,
        version: env.APP_VERSION,
        gitSha: env.GIT_SHA,
      },
      ordering: ordering ?? null,
      payment: await getPaymentCapability(db, env),
      sms,
      notifications: {
        pending: pending?.count ?? 0,
        failed: failed?.count ?? 0,
        workerLastSeenAt: heartbeat?.lastSeenAt ?? null,
      },
    });
  });
  return app;
}
