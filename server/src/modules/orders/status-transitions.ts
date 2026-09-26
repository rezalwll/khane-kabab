import type { OrderStatus } from '../../db/schema.js';
const allowed: Record<OrderStatus, OrderStatus[]> = {
  submitted: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['dispatched', 'delivered'],
  dispatched: ['delivered'],
  delivered: [],
  cancelled: [],
};
export const canTransitionOrder = (from: OrderStatus, to: OrderStatus) =>
  allowed[from].includes(to);
export const canTransitionOrderForFulfillment = (
  from: OrderStatus,
  to: OrderStatus,
  fulfillment: 'delivery' | 'pickup',
) =>
  canTransitionOrder(from, to) &&
  !(
    from === 'ready' &&
    ((fulfillment === 'delivery' && to !== 'dispatched') ||
      (fulfillment === 'pickup' && to !== 'delivered'))
  );
export const statusTimestampField = (status: OrderStatus) =>
  (
    ({
      confirmed: 'confirmedAt',
      preparing: 'preparingAt',
      ready: 'readyAt',
      dispatched: 'dispatchedAt',
      delivered: 'deliveredAt',
      cancelled: 'cancelledAt',
    }) as const
  )[status as Exclude<OrderStatus, 'submitted'>];
