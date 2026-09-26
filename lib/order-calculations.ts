import type { DeliveryMethod, PricingSummary } from '@/types/order';

export const DELIVERY_FEE = 49000;

export type PricedOrderItem = {
  food: { price: number };
  addons: { price: number }[];
  quantity: number;
};

export const calculateItemTotal = (item: PricedOrderItem) =>
  (item.food.price + item.addons.reduce((sum, addon) => sum + addon.price, 0)) * item.quantity;

export const calculateSubtotal = (items: PricedOrderItem[]) =>
  items.reduce((sum, item) => sum + calculateItemTotal(item), 0);

export const calculateDiscount = (subtotal: number, discountPercent: number) =>
  Math.round(subtotal * Math.max(0, discountPercent) / 100);

export const calculateDeliveryFee = (deliveryMethod: DeliveryMethod) =>
  deliveryMethod === 'delivery' ? DELIVERY_FEE : 0;

export function getOrderSummary(items: PricedOrderItem[], discountPercent: number, deliveryMethod: DeliveryMethod): PricingSummary {
  const subtotal = calculateSubtotal(items);
  const discount = calculateDiscount(subtotal, discountPercent);
  const deliveryFee = calculateDeliveryFee(deliveryMethod);
  return {subtotal, discount, deliveryFee, total: subtotal - discount + deliveryFee};
}
