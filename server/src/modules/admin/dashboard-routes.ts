import { and, desc, gte, inArray, ne, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import type { AppDb } from '../../db/client.js';
import { orders } from '../../db/schema.js';
import type { AppVariables } from '../../middleware/request-id.js';
import { requirePermission } from './middleware.js';
import type { AdminVariables } from './types.js';

export function adminDashboardRoutes(db: AppDb) {
  const app = new Hono<{ Variables: AppVariables & AdminVariables }>();
  app.use('*', requirePermission('dashboard:read'));
  app.get('/', async (c) => {
    const start = sql<Date>`date_trunc('day', now() at time zone 'Asia/Tehran') at time zone 'Asia/Tehran'`;
    const [metrics] = await db
      .select({
        count: sql<number>`count(*)::int`,
        value: sql<number>`coalesce(sum(${orders.totalToman}),0)::int`,
        average: sql<number>`coalesce(avg(${orders.totalToman}),0)::int`,
      })
      .from(orders)
      .where(and(gte(orders.createdAt, start), ne(orders.status, 'cancelled')));
    const statusRows = await db
      .select({ status: orders.status, count: sql<number>`count(*)::int` })
      .from(orders)
      .where(gte(orders.createdAt, start))
      .groupBy(orders.status);
    const actionable = [
      'submitted',
      'confirmed',
      'preparing',
      'ready',
    ] as const;
    const [actionRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(inArray(orders.status, [...actionable]));
    const recentOrders = await db
      .select({
        id: orders.id,
        publicNumber: orders.publicNumber,
        customerName: orders.customerName,
        status: orders.status,
        fulfillmentType: orders.fulfillmentType,
        totalToman: orders.totalToman,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(8);
    return c.json({
      todayOrderCount: metrics?.count ?? 0,
      todayOrderValueToman: metrics?.value ?? 0,
      pendingOrders: actionRow?.count ?? 0,
      averageOrderValueToman: metrics?.average ?? 0,
      ordersByStatus: statusRows,
      today: {
        orderCount: metrics?.count ?? 0,
        orderValueToman: metrics?.value ?? 0,
        averageOrderToman: metrics?.average ?? 0,
        actionableCount: actionRow?.count ?? 0,
      },
      statusSummary: statusRows,
      recentOrders,
    });
  });
  return app;
}
