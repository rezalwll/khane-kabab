import { describe, expect, it } from 'vitest';
import { ApiError } from '../../lib/errors.js';
import {
  calculatePricing,
  type PricingLineInput,
  type PricingSettings,
} from './pricing.js';
const settings: PricingSettings = {
  defaultDeliveryFeeToman: 49000,
  deliveryEnabled: true,
  pickupEnabled: true,
  minimumOrderToman: null,
  ordersEnabled: true,
};
const line: PricingLineInput = {
  product: {
    id: 'p1',
    title: 'کباب',
    priceToman: 100000,
    isActive: true,
    isAvailable: true,
  },
  quantity: 2,
  options: [],
};
const coupon = {
  code: 'KABAB10',
  type: 'percentage' as const,
  value: 10,
  maxDiscountToman: null,
  minOrderToman: null,
  startsAt: null,
  endsAt: null,
  usageLimit: null,
  usageCount: 0,
  isActive: true,
};
describe('server pricing', () => {
  it('applies KABAB10 to subtotal only', () =>
    expect(
      calculatePricing({
        lines: [line],
        coupon,
        fulfillmentType: 'delivery',
        settings,
      }),
    ).toMatchObject({
      subtotalToman: 200000,
      discountToman: 20000,
      deliveryFeeToman: 49000,
      totalToman: 229000,
    }));
  it('sets pickup fee to zero', () =>
    expect(
      calculatePricing({ lines: [line], fulfillmentType: 'pickup', settings })
        .deliveryFeeToman,
    ).toBe(0));
  it('adds delivery fee', () =>
    expect(
      calculatePricing({ lines: [line], fulfillmentType: 'delivery', settings })
        .totalToman,
    ).toBe(249000));
  it('rejects unavailable products', () =>
    expect(() =>
      calculatePricing({
        lines: [{ ...line, product: { ...line.product, isAvailable: false } }],
        fulfillmentType: 'pickup',
        settings,
      }),
    ).toThrow(ApiError));
  it('rejects invalid quantity', () =>
    expect(() =>
      calculatePricing({
        lines: [{ ...line, quantity: 0 }],
        fulfillmentType: 'pickup',
        settings,
      }),
    ).toThrow(ApiError));
  it('ignores any client price because input uses authoritative product records', () =>
    expect(
      calculatePricing({ lines: [line], fulfillmentType: 'pickup', settings })
        .subtotalToman,
    ).toBe(200000));
  it.each([
    [{ ...settings, ordersEnabled: false }, 'delivery', 'ORDERS_DISABLED'],
    [
      { ...settings, deliveryEnabled: false },
      'delivery',
      'FULFILLMENT_DISABLED',
    ],
    [{ ...settings, pickupEnabled: false }, 'pickup', 'FULFILLMENT_DISABLED'],
    [
      { ...settings, minimumOrderToman: 250000 },
      'pickup',
      'MINIMUM_ORDER_NOT_MET',
    ],
  ] as const)(
    'enforces restaurant operation settings',
    (configured, fulfillmentType, code) => {
      try {
        calculatePricing({
          lines: [line],
          fulfillmentType,
          settings: configured,
        });
        throw new Error('Expected pricing to fail');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).code).toBe(code);
      }
    },
  );
});
