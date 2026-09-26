import { asc, eq } from 'drizzle-orm';
import { Hono, type Context } from 'hono';
import { z } from 'zod';
import type { AppDb } from '../../db/client.js';
import {
  adminAuditLogs,
  openingHours,
  restaurantSettings,
} from '../../db/schema.js';
import { ApiError } from '../../lib/errors.js';
import type { AppVariables } from '../../middleware/request-id.js';
import { requirePermission } from './middleware.js';
import type { AdminVariables } from './types.js';
type Ctx = Context<{ Variables: AppVariables & AdminVariables }>;
const settingsSchema = z.object({
  restaurantName: z.string().trim().min(1).max(160),
  phone: z.string().trim().min(1).max(40),
  instagram: z.string().trim().max(120),
  city: z.string().trim().min(1).max(120),
  deliveryEnabled: z.boolean(),
  pickupEnabled: z.boolean(),
  defaultDeliveryFeeToman: z.number().int().min(0).max(1_000_000_000),
  minimumOrderToman: z.number().int().min(0).max(1_000_000_000).nullable(),
  ordersEnabled: z.boolean(),
});
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const hourSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    openTime: time.nullable(),
    closeTime: time.nullable(),
    isClosed: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (!value.isClosed && (!value.openTime || !value.closeTime))
      ctx.addIssue({ code: 'custom', message: 'زمان باز و بسته‌شدن لازم است.' });
    if (
      !value.isClosed &&
      value.openTime &&
      value.closeTime &&
      value.openTime >= value.closeTime
    )
      ctx.addIssue({
        code: 'custom',
        message: 'بازه شبانه فعلاً پشتیبانی نمی‌شود.',
      });
  });
export function adminSettingsRoutes(db: AppDb) {
  const app = new Hono<{ Variables: AppVariables & AdminVariables }>();
  app.use('*', requirePermission('settings:read'));
  app.get('/', async (c) => {
    const [row] = await db.select().from(restaurantSettings).limit(1);
    return c.json({ settings: row ?? null });
  });
  app.patch('/', requirePermission('settings:write'), async (c) => {
    const parsed = settingsSchema
      .partial()
      .safeParse(await c.req.json().catch(() => null));
    if (!parsed.success || Object.keys(parsed.data).length === 0)
      throw new ApiError(
        422,
        'VALIDATION_ERROR',
        parsed.success
          ? 'حداقل یک فیلد لازم است.'
          : (parsed.error.issues[0]?.message ?? 'داده نامعتبر است.'),
      );
    const [existing] = await db.select().from(restaurantSettings).limit(1);
    if (!existing)
      throw new ApiError(
        409,
        'CONFLICT',
        'ابتدا داده‌های پایه رستوران را seed کنید.',
      );
    const [row] = await db
      .update(restaurantSettings)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(restaurantSettings.id, existing.id))
      .returning();
    await log(
      db,
      c,
      'RESTAURANT_SETTINGS_UPDATED',
      'restaurant_settings',
      existing.id,
    );
    return c.json({ settings: row });
  });
  return app;
}
export function adminOpeningHoursRoutes(db: AppDb) {
  const app = new Hono<{ Variables: AppVariables & AdminVariables }>();
  app.use('*', requirePermission('settings:read'));
  app.get('/', async (c) =>
    c.json({
      openingHours: await db
        .select()
        .from(openingHours)
        .orderBy(asc(openingHours.dayOfWeek)),
    }),
  );
  app.put('/', requirePermission('settings:write'), async (c) => {
    const parsed = z
      .object({ openingHours: z.array(hourSchema).length(7) })
      .safeParse(await c.req.json().catch(() => null));
    if (
      !parsed.success ||
      new Set(parsed.data.openingHours.map((x) => x.dayOfWeek)).size !== 7
    )
      throw new ApiError(
        422,
        'VALIDATION_ERROR',
        parsed.success
          ? 'هفت روز یکتا لازم است.'
          : (parsed.error.issues[0]?.message ?? 'ساعات معتبر نیست.'),
      );
    await db.transaction(async (tx) => {
      for (const row of parsed.data.openingHours)
        await tx
          .insert(openingHours)
          .values({
            ...row,
            openTime: row.isClosed ? null : row.openTime,
            closeTime: row.isClosed ? null : row.closeTime,
          })
          .onConflictDoUpdate({
            target: openingHours.dayOfWeek,
            set: {
              openTime: row.isClosed ? null : row.openTime,
              closeTime: row.isClosed ? null : row.closeTime,
              isClosed: row.isClosed,
              updatedAt: new Date(),
            },
          });
    });
    await log(db, c, 'OPENING_HOURS_UPDATED', 'opening_hours', 'all');
    return c.json({
      openingHours: await db
        .select()
        .from(openingHours)
        .orderBy(asc(openingHours.dayOfWeek)),
    });
  });
  return app;
}
async function log(
  db: AppDb,
  c: Ctx,
  action: string,
  entityType: string,
  entityId: string,
) {
  await db.insert(adminAuditLogs).values({
    adminUserId: c.get('admin').id,
    action,
    entityType,
    entityId,
    requestId: c.get('requestId'),
    metadata: {},
  });
}
