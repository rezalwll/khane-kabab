export type DeliveryMethod = 'delivery' | 'pickup';
export type PaymentMethod = 'online' | 'on-delivery';
export type OrderStatus = 'submitted' | 'confirmed' | 'preparing' | 'ready' | 'delivered';

export type PricingSummary = {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
};

export type OrderItemSnapshot = {
  title: string;
  quantity: number;
  addons: string[];
  note?: string;
  total: number;
};

export type OrderSnapshot = PricingSummary & {
  id: string;
  createdAt: string;
  items: OrderItemSnapshot[];
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  customerName: string;
  mobile: string;
  address?: string;
  deliveryTime: string;
  status: OrderStatus;
};
