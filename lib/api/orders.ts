import { apiRequest } from './client';
import type { ApiOrderLine } from './coupons';
export type CreateApiOrder = {
  clientOrderId: string;
  customer: { name: string; mobile: string };
  fulfillmentType: 'delivery' | 'pickup';
  address?: { address?: string; plaque?: string; unit?: string; note?: string };
  requestedTime?: string;
  paymentMethod: 'online' | 'on_delivery';
  couponCode?: string;
  customerNote?: string;
  items: ApiOrderLine[];
};
export type ApiQuote = {
  lines: {
    productId: string;
    title: string;
    unitPriceToman: number;
    quantity: number;
    options: { optionId: string; name: string; priceDeltaToman: number }[];
    lineTotalToman: number;
  }[];
  subtotalToman: number;
  discountToman: number;
  deliveryFeeToman: number;
  totalToman: number;
  coupon: { normalizedCode: string } | null;
};
export type ApiOrderSummary = {
  publicNumber: string;
  trackingToken?: string;
  duplicate?: boolean;
  status:
    | 'submitted'
    | 'confirmed'
    | 'preparing'
    | 'ready'
    | 'dispatched'
    | 'delivered'
    | 'cancelled';
  paymentStatus: 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  fulfillmentType: 'delivery' | 'pickup';
  requestedTime?: string | null;
  items: {
    title: string;
    unitPriceToman: number;
    quantity: number;
    note?: string | null;
    lineTotalToman: number;
    options: { name: string; priceDeltaToman: number }[];
  }[];
  pricing: {
    subtotalToman: number;
    discountToman: number;
    deliveryFeeToman: number;
    totalToman: number;
    couponCode: string | null;
  };
  timestamps: Record<string, string | null>;
};
export const quoteOrder = (
  body: {
    couponCode?: string;
    fulfillmentType: 'delivery' | 'pickup';
    items: ApiOrderLine[];
  },
  signal?: AbortSignal,
) =>
  apiRequest<ApiQuote>('/api/v1/orders/quote', {
    method: 'POST',
    body: JSON.stringify(body),
    signal,
  });
export const createOrder = (body: CreateApiOrder) =>
  apiRequest<ApiOrderSummary>('/api/v1/orders', {
    method: 'POST',
    body: JSON.stringify(body),
  });
export const getOrder = (publicNumber: string, trackingToken: string) =>
  apiRequest<ApiOrderSummary>(
    `/api/v1/orders/${encodeURIComponent(publicNumber)}`,
    { headers: { 'X-Order-Token': trackingToken } },
  );
export const startPayment = (publicNumber: string, trackingToken: string) =>
  apiRequest<{ redirectUrl: string }>(
    `/api/v1/payments/${encodeURIComponent(publicNumber)}/start`,
    { method: 'POST', headers: { 'X-Order-Token': trackingToken } },
  );
