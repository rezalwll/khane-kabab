export type TemplateKey =
  | 'ORDER_SUBMITTED'
  | 'ORDER_CONFIRMED'
  | 'READY_PICKUP'
  | 'DISPATCHED'
  | 'CANCELLED'
  | 'PAYMENT_CONFIRMED';
const templates: Record<
  TemplateKey,
  (value: { publicNumber: string }) => string
> = {
  ORDER_SUBMITTED: (v) => `سفارش ${v.publicNumber} در خانه کباب طهران ثبت شد.`,
  ORDER_CONFIRMED: (v) => `سفارش ${v.publicNumber} تایید شد.`,
  READY_PICKUP: (v) => `سفارش ${v.publicNumber} آماده دریافت است.`,
  DISPATCHED: (v) => `سفارش ${v.publicNumber} برای ارسال تحویل پیک شد.`,
  CANCELLED: (v) => `سفارش ${v.publicNumber} لغو شد.`,
  PAYMENT_CONFIRMED: (v) => `پرداخت سفارش ${v.publicNumber} تایید شد.`,
};
export const renderSmsTemplate = (
  key: TemplateKey,
  payload: { publicNumber: string },
) => templates[key](payload);
