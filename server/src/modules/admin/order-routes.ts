import { and, desc, eq, gte, ilike, inArray, lte, or, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import type { AppDb } from '../../db/client.js';
import type { Env } from '../../config/env.js';
import type pino from 'pino';
import {
  adminAuditLogs,
  orderItemOptions,
  orderItems,
  orders,
  orderStatusEnum,
} from '../../db/schema.js';
import { ApiError, notFound } from '../../lib/errors.js';
import type { AppVariables } from '../../middleware/request-id.js';
import {
  canTransitionOrderForFulfillment,
  statusTimestampField,
} from '../orders/status-transitions.js';
import { requirePermission } from './middleware.js';
import type { AdminVariables } from './types.js';
import { enqueueNotificationIfEnabled } from '../notifications/service.js';

const filters = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(orderStatusEnum.enumValues).optional(),
  fulfillmentType: z.enum(['delivery', 'pickup']).optional(),
  q: z.string().trim().max(120).optional(),
  search: z.string().trim().max(120).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
const statusInput = z.object({
  status: z.enum(orderStatusEnum.enumValues),
  expectedStatus: z.enum(orderStatusEnum.enumValues).optional(),
});

export function adminOrderRoutes(db: AppDb, env: Env, logger: pino.Logger) {
  const app = new Hono<{ Variables: AppVariables & AdminVariables }>();
  app.use('*', requirePermission('orders:read'));
  app.get('/', async (c) => {
    const parsed = filters.safeParse(c.req.query());
    if (!parsed.success)
      throw new ApiError(422, 'VALIDATION_ERROR', 'فیلترهای سفارش معتبر نیست.');
    const { page, limit, status, fulfillmentType, from, to } = parsed.data;
    const q = parsed.data.search ?? parsed.data.q;
    const where = and(
      status ? eq(orders.status, status) : undefined,
      fulfillmentType ? eq(orders.fulfillmentType, fulfillmentType) : undefined,
      q
        ? or(
            ilike(orders.publicNumber, `%${q}%`),
            ilike(orders.customerName, `%${q}%`),
            ilike(orders.mobile, `%${q}%`),
          )
        : undefined,
      from ? gte(orders.createdAt, from) : undefined,
      to ? lte(orders.createdAt, to) : undefined,
    );
    const [countRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(where);
    const rows = await db
      .select({
        id: orders.id,
        publicNumber: orders.publicNumber,
        status: orders.status,
        fulfillmentType: orders.fulfillmentType,
        paymentMethod: orders.paymentMethod,
        paymentStatus: orders.paymentStatus,
        customerName: orders.customerName,
        mobile: orders.mobile,
        totalToman: orders.totalToman,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
      })
      .from(orders)
      .where(where)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);
    return c.json({
      orders: rows,
      pagination: {
        page,
        limit,
        total: countRow?.count ?? 0,
        totalPages: Math.ceil((countRow?.count ?? 0) / limit),
      },
    });
  });
  app.get('/:id', async (c) => {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, c.req.param('id')))
      .limit(1);
    if (!order) throw notFound('سفارش پیدا نشد.');
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));
    const ids = items.map((x) => x.id);
    const opts = ids.length
      ? await db
          .select()
          .from(orderItemOptions)
          .where(inArray(orderItemOptions.orderItemId, ids))
      : [];
    return c.json({
      order: {
        ...order,
        trackingTokenHash: undefined,
        items: items.map((item) => ({
          ...item,
          options: opts.filter((option) => option.orderItemId === item.id),
        })),
      },
    });
  });
  app.patch('/:id/status', requirePermission('orders:write'), async (c) => {
    const parsed = statusInput.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success)
      throw new ApiError(422, 'VALIDATION_ERROR', 'وضعیت سفارش معتبر نیست.');
    const { status } = parsed.data;
    const [currentOrder] = await db
      .select({
        id: orders.id,
        publicNumber: orders.publicNumber,
        mobile: orders.mobile,
        fulfillmentType: orders.fulfillmentType,
        status: orders.status,
      })
      .from(orders)
      .where(eq(orders.id, c.req.param('id')))
      .limit(1);
    if (!currentOrder) throw notFound('سفارش پیدا نشد.');
    const expectedStatus = parsed.data.expectedStatus ?? currentOrder.status;
    if (
      !canTransitionOrderForFulfillment(
        expectedStatus,
        status,
        currentOrder.fulfillmentType,
      )
    )
      throw new ApiError(
        409,
        'INVALID_STATUS_TRANSITION',
        'این تغییر وضعیت مجاز نیست.',
      );
    const timestampField = statusTimestampField(status);
    const admin = c.get('admin');
    const now = new Date();
    const updated = await db.transaction(async (tx) => {
      const [row] = await tx
        .update(orders)
        .set({
          status,
          updatedAt: now,
          ...(timestampField ? { [timestampField]: now } : {}),
        })
        .where(
          and(
            eq(orders.id, c.req.param('id')),
            eq(orders.status, expectedStatus),
          ),
        )
        .returning({
          id: orders.id,
          publicNumber: orders.publicNumber,
          status: orders.status,
          updatedAt: orders.updatedAt,
        });
      if (!row) {
        const [exists] = await tx
          .select({ id: orders.id })
          .from(orders)
          .where(eq(orders.id, c.req.param('id')))
          .limit(1);
        if (!exists) throw notFound('سفارش پیدا نشد.');
        throw new ApiError(
          409,
          'CONFLICT',
          'وضعیت سفارش تغییر کرده است؛ فهرست را تازه کنید.',
        );
      }
      await tx.insert(adminAuditLogs).values({
        adminUserId: admin.id,
        action: 'ORDER_STATUS_CHANGED',
        entityType: 'order',
        entityId: row.id,
        requestId: c.get('requestId'),
        metadata: { from: expectedStatus, to: status },
      });
      const eventType =
        status === 'confirmed'
          ? 'ORDER_CONFIRMED'
          : status === 'ready' && currentOrder.fulfillmentType === 'pickup'
            ? 'ORDER_READY_PICKUP'
            : status === 'dispatched'
              ? 'ORDER_DISPATCHED'
              : status === 'cancelled'
                ? 'ORDER_CANCELLED'
                : null;
      if (eventType)
        await enqueueNotificationIfEnabled(tx as unknown as AppDb, env, {
          eventType,
          orderId: currentOrder.id,
          recipient: currentOrder.mobile,
          publicNumber: currentOrder.publicNumber,
        });
      return row;
    });
    logger.info(
      {
        requestId: c.get('requestId'),
        publicNumber: updated.publicNumber,
        from: expectedStatus,
        to: status,
      },
      'order status changed',
    );
    return c.json({ order: updated });
  });
  return app;
}
