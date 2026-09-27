import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import type { AppDb } from '../../db/client.js';
import {
  adminAuditLogs,
  notificationOutbox,
  notificationStatusEnum,
  orders,
} from '../../db/schema.js';
import { ApiError, notFound } from '../../lib/errors.js';
import type { AppVariables } from '../../middleware/request-id.js';
import { maskMobile } from '../notifications/service.js';
import { requirePermission } from './middleware.js';
import type { AdminVariables } from './types.js';

const filters = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(notificationStatusEnum.enumValues).optional(),
  q: z.string().trim().max(120).optional(),
});

export function adminNotificationRoutes(db: AppDb) {
  const app = new Hono<{ Variables: AppVariables & AdminVariables }>();
  app.use('*', requirePermission('settings:read'));
  app.get('/', async (c) => {
    const parsed = filters.safeParse(c.req.query());
    if (!parsed.success)
      throw new ApiError(422, 'VALIDATION_ERROR', 'فیلترها معتبر نیستند.');
    const { page, limit, status, q } = parsed.data;
    const where = and(
      status ? eq(notificationOutbox.status, status) : undefined,
      q
        ? or(
            ilike(orders.publicNumber, `%${q}%`),
            ilike(notificationOutbox.eventType, `%${q}%`),
          )
        : undefined,
    );
    const base = db
      .select({
        id: notificationOutbox.id,
        status: notificationOutbox.status,
        eventType: notificationOutbox.eventType,
        recipient: notificationOutbox.recipient,
        templateKey: notificationOutbox.templateKey,
        attempts: notificationOutbox.attempts,
        lastErrorCode: notificationOutbox.lastErrorCode,
        createdAt: notificationOutbox.createdAt,
        sentAt: notificationOutbox.sentAt,
        publicNumber: orders.publicNumber,
      })
      .from(notificationOutbox)
      .leftJoin(orders, eq(notificationOutbox.orderId, orders.id))
      .where(where);
    const rows = await base
      .orderBy(desc(notificationOutbox.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);
    const [count] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notificationOutbox)
      .leftJoin(orders, eq(notificationOutbox.orderId, orders.id))
      .where(where);
    return c.json({
      notifications: rows.map((row) => ({
        ...row,
        recipient: maskMobile(row.recipient),
      })),
      pagination: {
        page,
        limit,
        total: count?.count ?? 0,
        totalPages: Math.ceil((count?.count ?? 0) / limit),
      },
    });
  });
  app.post('/:id/retry', requirePermission('settings:write'), async (c) => {
    const [current] = await db
      .select({ id: notificationOutbox.id, status: notificationOutbox.status })
      .from(notificationOutbox)
      .where(eq(notificationOutbox.id, c.req.param('id')))
      .limit(1);
    if (!current) throw notFound('پیام پیدا نشد.');
    if (!['failed', 'skipped'].includes(current.status))
      throw new ApiError(409, 'CONFLICT', 'این پیام قابل تلاش مجدد نیست.');
    await db.transaction(async (tx) => {
      await tx
        .update(notificationOutbox)
        .set({
          status: 'pending',
          nextAttemptAt: null,
          lastErrorCode: null,
          updatedAt: new Date(),
        })
        .where(eq(notificationOutbox.id, current.id));
      await tx.insert(adminAuditLogs).values({
        adminUserId: c.get('admin').id,
        action: 'NOTIFICATION_RETRY_REQUESTED',
        entityType: 'notification_outbox',
        entityId: current.id,
        requestId: c.get('requestId'),
        metadata: {},
      });
    });
    return c.json({ ok: true });
  });
  return app;
}
