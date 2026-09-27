import { eq, inArray, sql } from 'drizzle-orm';
import type { AppDb, QueryDb } from '../../db/client.js';
import type { Env } from '../../config/env.js';
import {
  coupons,
  orderItemOptions,
  orderItems,
  orders,
} from '../../db/schema.js';
import { ApiError, notFound } from '../../lib/errors.js';
import { createUniqueOrderNumber } from '../../lib/order-number.js';
import {
  createOrderToken,
  hashOrderToken,
  verifyOrderToken,
} from '../../lib/order-token.js';
import { normalizeIranianMobile } from '../../lib/phone.js';
import { enqueueNotificationIfEnabled } from '../notifications/service.js';
import { getPaymentCapability } from '../payments/service.js';
import { calculatePricing } from '../pricing/pricing.js';
import { resolvePricingContext } from '../pricing/resolve-context.js';
import type { CreateOrderRequest, PricingRequest } from './input.js';
const isConflict = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as { code?: string }).code === '23505';
export async function quoteOrder(db: AppDb, input: PricingRequest) {
  const context = await resolvePricingContext(db, input);
  const pricing = calculatePricing({
    ...context,
    fulfillmentType: input.fulfillmentType,
  });
  return {
    lines: pricing.lines.map((line) => ({
      productId: line.productId,
      title: line.productTitle,
      unitPriceToman: line.unitPriceToman,
      quantity: line.quantity,
      options: line.options.map((option) => ({
        optionId: option.id,
        name: option.name,
        priceDeltaToman: option.priceDeltaToman,
      })),
      lineTotalToman: line.lineTotalToman,
    })),
    subtotalToman: pricing.subtotalToman,
    discountToman: pricing.discountToman,
    deliveryFeeToman: pricing.deliveryFeeToman,
    totalToman: pricing.totalToman,
    coupon: pricing.couponCode ? { normalizedCode: pricing.couponCode } : null,
  };
}
async function serializeOrder(db: AppDb, order: typeof orders.$inferSelect) {
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));
  const itemIds = items.map((item) => item.id);
  const optionRows = itemIds.length
    ? await db
        .select()
        .from(orderItemOptions)
        .where(inArray(orderItemOptions.orderItemId, itemIds))
    : [];
  return {
    publicNumber: order.publicNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
    fulfillmentType: order.fulfillmentType,
    requestedTime: order.requestedTime,
    items: items.map((item) => ({
      title: item.productTitleSnapshot,
      unitPriceToman: item.unitPriceToman,
      quantity: item.quantity,
      note: item.note,
      lineTotalToman: item.lineTotalToman,
      options: optionRows
        .filter((option) => option.orderItemId === item.id)
        .map((option) => ({
          name: option.optionNameSnapshot,
          priceDeltaToman: option.priceDeltaToman,
        })),
    })),
    pricing: {
      subtotalToman: order.subtotalToman,
      discountToman: order.discountToman,
      deliveryFeeToman: order.deliveryFeeToman,
      totalToman: order.totalToman,
      couponCode: order.couponCode,
    },
    timestamps: {
      confirmedAt: order.confirmedAt,
      preparingAt: order.preparingAt,
      readyAt: order.readyAt,
      dispatchedAt: order.dispatchedAt,
      deliveredAt: order.deliveredAt,
      cancelledAt: order.cancelledAt,
    },
  };
}
async function rotateDuplicate(db: AppDb, clientOrderId: string) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.clientOrderId, clientOrderId))
    .limit(1);
  if (!order) return null;
  const trackingToken = createOrderToken();
  await db
    .update(orders)
    .set({
      trackingTokenHash: hashOrderToken(trackingToken),
      updatedAt: new Date(),
    })
    .where(eq(orders.id, order.id));
  return {
    ...(await serializeOrder(db, order)),
    trackingToken,
    duplicate: true,
  };
}
export async function createOrder(
  db: AppDb,
  env: Env,
  input: CreateOrderRequest,
) {
  const duplicate = await rotateDuplicate(db, input.clientOrderId);
  if (duplicate) return duplicate;
  if (input.paymentMethod === 'online') {
    const capability = await getPaymentCapability(db, env);
    if (!capability.effectiveEnabled)
      throw new ApiError(
        409,
        'ONLINE_PAYMENT_DISABLED',
        'پرداخت آنلاین فعلاً فعال نیست.',
      );
  }
  const mobile = normalizeIranianMobile(input.customer.mobile);
  for (let attempt = 0; attempt < 3; attempt++)
    try {
      return await db.transaction(async (tx) => {
        if (input.couponCode)
          await tx.execute(
            sql`select id from coupons where code=${input.couponCode.trim().toUpperCase()} for update`,
          );
        const context = await resolvePricingContext(
          tx as unknown as QueryDb,
          input,
        );
        const pricing = calculatePricing({
          ...context,
          fulfillmentType: input.fulfillmentType,
        });
        const publicNumber = await createUniqueOrderNumber(
          async (value) =>
            (
              await tx
                .select({ id: orders.id })
                .from(orders)
                .where(eq(orders.publicNumber, value))
                .limit(1)
            ).length > 0,
        );
        const trackingToken = createOrderToken();
        const [order] = await tx
          .insert(orders)
          .values({
            clientOrderId: input.clientOrderId,
            publicNumber,
            trackingTokenHash: hashOrderToken(trackingToken),
            status: 'submitted',
            fulfillmentType: input.fulfillmentType,
            paymentMethod: input.paymentMethod,
            paymentStatus:
              input.paymentMethod === 'online' ? 'pending' : 'unpaid',
            customerName: input.customer.name,
            mobile,
            address:
              input.fulfillmentType === 'delivery'
                ? input.address?.address
                : undefined,
            plaque:
              input.fulfillmentType === 'delivery'
                ? input.address?.plaque
                : undefined,
            unit:
              input.fulfillmentType === 'delivery'
                ? input.address?.unit
                : undefined,
            addressNote:
              input.fulfillmentType === 'delivery'
                ? input.address?.note
                : undefined,
            requestedTime: input.requestedTime,
            customerNote: input.customerNote,
            subtotalToman: pricing.subtotalToman,
            discountToman: pricing.discountToman,
            deliveryFeeToman: pricing.deliveryFeeToman,
            totalToman: pricing.totalToman,
            couponCode: pricing.couponCode,
          })
          .returning();
        if (!order) throw new Error('Order insert failed');
        for (const line of pricing.lines) {
          const [item] = await tx
            .insert(orderItems)
            .values({
              orderId: order.id,
              productId: line.productId,
              productTitleSnapshot: line.productTitle,
              unitPriceToman: line.unitPriceToman,
              quantity: line.quantity,
              lineSubtotalToman: line.lineSubtotalToman,
              lineOptionsTotalToman: line.lineOptionsTotalToman,
              lineTotalToman: line.lineTotalToman,
              note: line.note,
            })
            .returning({ id: orderItems.id });
          if (!item) throw new Error('Order item insert failed');
          if (line.options.length)
            await tx.insert(orderItemOptions).values(
              line.options.map((option) => ({
                orderItemId: item.id,
                optionId: option.id,
                optionNameSnapshot: option.name,
                priceDeltaToman: option.priceDeltaToman,
              })),
            );
        }
        if (pricing.couponCode)
          await tx
            .update(coupons)
            .set({
              usageCount: sql`${coupons.usageCount}+1`,
              updatedAt: new Date(),
            })
            .where(eq(coupons.code, pricing.couponCode));
        await enqueueNotificationIfEnabled(tx as unknown as AppDb, env, {
          eventType: 'ORDER_SUBMITTED',
          orderId: order.id,
          recipient: mobile,
          publicNumber,
        });
        return {
          ...(await serializeOrder(tx as unknown as AppDb, order)),
          trackingToken,
          duplicate: false,
        };
      });
    } catch (error) {
      if (isConflict(error)) {
        const same = await rotateDuplicate(db, input.clientOrderId);
        if (same) return same;
        if (attempt < 2) continue;
      }
      throw error;
    }
  throw new Error('Unable to create order');
}
export async function getOrder(
  db: AppDb,
  publicNumber: string,
  rawToken: string | undefined,
) {
  if (!rawToken) throw notFound('سفارش پیدا نشد.');
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.publicNumber, publicNumber))
    .limit(1);
  if (!order || !verifyOrderToken(rawToken, order.trackingTokenHash))
    throw notFound('سفارش پیدا نشد.');
  return serializeOrder(db, order);
}
