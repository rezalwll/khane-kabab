import type { ApiOrderLine } from '@/lib/api/coupons';
import type { CartItem } from '@/stores/cart-store';

export const cartItemsToApiLines = (items: CartItem[]): ApiOrderLine[] =>
  items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    optionIds: item.selectedOptions.map((option) => option.id),
    ...(item.note ? { note: item.note } : {}),
  }));
