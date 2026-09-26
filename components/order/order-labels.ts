import type { DeliveryMethod, OrderStatus, PaymentMethod } from '@/types/order';
export const deliveryLabels:Record<DeliveryMethod,string>={delivery:'ارسال با پیک',pickup:'دریافت حضوری'};
export const paymentLabels:Record<PaymentMethod,string>={online:'پرداخت آنلاین نمایشی','on-delivery':'پرداخت هنگام دریافت'};
export const statusLabels:Record<OrderStatus,string>={submitted:'ثبت‌شده در این مرورگر',confirmed:'تأییدشده',preparing:'در حال آماده‌سازی',ready:'آماده دریافت',delivered:'تحویل‌شده'};
export const timeLabel=(value:string)=>value==='asap'?'سریع‌ترین زمان ممکن':value;
