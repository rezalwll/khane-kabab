import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../../config/env.js';
import type { AppDb } from '../../db/client.js';
import {
  adminAuditLogs,
  notificationSettings,
  paymentSettings,
} from '../../db/schema.js';
import { ApiError } from '../../lib/errors.js';
import type { AppVariables } from '../../middleware/request-id.js';
import { getNotificationCapability } from '../notifications/service.js';
import { getPaymentCapability } from '../payments/service.js';
import { requirePermission } from './middleware.js';
import type { AdminVariables } from './types.js';

const integrationInput = z.object({
  onlinePaymentEnabled: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
  notifyOrderSubmitted: z.boolean().optional(),
  notifyOrderConfirmed: z.boolean().optional(),
  notifyOrderReady: z.boolean().optional(),
  notifyOrderDispatched: z.boolean().optional(),
  notifyOrderCancelled: z.boolean().optional(),
});

export function adminIntegrationRoutes(db: AppDb, env: Env) {
  const app = new Hono<{ Variables: AppVariables & AdminVariables }>();
  app.use('*', requirePermission('settings:read'));
  app.get('/', async (c) =>
    c.json({
      payment: await getPaymentCapability(db, env),
      notifications: await getNotificationCapability(db, env),
    }),
  );
  app.patch('/', requirePermission('settings:write'), async (c) => {
    const parsed = integrationInput.safeParse(
      await c.req.json().catch(() => null),
    );
    if (!parsed.success || Object.keys(parsed.data).length === 0)
      throw new ApiError(422, 'VALIDATION_ERROR', 'تنظیمات اتصال معتبر نیست.');

    if (
      parsed.data.onlinePaymentEnabled &&
      !(await getPaymentCapability(db, env)).configured
    )
      throw new ApiError(
        409,
        'PAYMENT_PROVIDER_NOT_CONFIGURED',
        'ابتدا درگاه پرداخت را در محیط سرور پیکربندی کنید.',
      );
    if (
      parsed.data.smsEnabled &&
      !(await getNotificationCapability(db, env)).configured
    )
      throw new ApiError(
        409,
        'SMS_PROVIDER_NOT_CONFIGURED',
        'ابتدا سرویس پیامک را در محیط سرور پیکربندی کنید.',
      );

    const paymentUpdate =
      parsed.data.onlinePaymentEnabled === undefined
        ? undefined
        : { onlinePaymentEnabled: parsed.data.onlinePaymentEnabled };
    const {
      onlinePaymentEnabled: _onlinePaymentEnabled,
      ...notificationUpdate
    } = parsed.data;
    await db.transaction(async (tx) => {
      if (paymentUpdate) {
        const [row] = await tx.select().from(paymentSettings).limit(1);
        if (!row)
          throw new ApiError(409, 'CONFLICT', 'داده پايه پرداخت وجود ندارد.');
        await tx
          .update(paymentSettings)
          .set({ ...paymentUpdate, updatedAt: new Date() })
          .where(eq(paymentSettings.id, row.id));
      }
      if (Object.keys(notificationUpdate).length) {
        const [row] = await tx.select().from(notificationSettings).limit(1);
        if (!row)
          throw new ApiError(409, 'CONFLICT', 'داده پايه پیامک وجود ندارد.');
        await tx
          .update(notificationSettings)
          .set({ ...notificationUpdate, updatedAt: new Date() })
          .where(eq(notificationSettings.id, row.id));
      }
      await tx.insert(adminAuditLogs).values({
        adminUserId: c.get('admin').id,
        action: 'INTEGRATION_SETTINGS_UPDATED',
        entityType: 'integration_settings',
        entityId: 'singleton',
        requestId: c.get('requestId'),
        metadata: parsed.data,
      });
    });
    return c.json({
      payment: await getPaymentCapability(db, env),
      notifications: await getNotificationCapability(db, env),
    });
  });
  return app;
}
