import type { DeliveryMethod, OrderStatus, PaymentMethod } from '@/types/order';
export const deliveryLabels: Record<DeliveryMethod, string> = {
  delivery: 'ارسال با پیک',
  pickup: 'دریافت حضوری',
};
export const paymentLabels: Record<PaymentMethod, string> = {
  online: 'پرداخت آنلاین',
  'on-delivery': 'پرداخت هنگام دریافت',
};
export const statusLabels: Record<OrderStatus, string> = {
  submitted: 'ثبت‌شده',
  confirmed: 'تأییدشده',
  preparing: 'در حال آماده‌سازی',
  ready: 'آماده دریافت',
  dispatched: 'ارسال‌شده',
  delivered: 'تحویل‌شده',
  cancelled: 'لغوشده',
};
export const timeLabel = (value: string) =>
  value === 'asap' ? 'سریع‌ترین زمان ممکن' : value;
