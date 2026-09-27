import { expect, it } from 'vitest';
import { createOrderSchema } from './input.js';
it('strips client-supplied prices from order input', () => {
  const parsed = createOrderSchema.parse({
    clientOrderId: '00000000-0000-4000-8000-000000000099',
    customer: { name: 'کاربر آزمایشی', mobile: '09123456789' },
    fulfillmentType: 'pickup',
    paymentMethod: 'on_delivery',
    items: [
      {
        productId: '00000000-0000-4000-8000-000000000010',
        quantity: 1,
        optionIds: [],
        priceToman: 1,
        totalToman: 1,
      },
    ],
  });
  expect(parsed.items[0]).not.toHaveProperty('priceToman');
  expect(parsed).not.toHaveProperty('totalToman');
});
