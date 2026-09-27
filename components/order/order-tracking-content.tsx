'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock3, PackageCheck } from 'lucide-react';
import { getOrder, type ApiOrderSummary } from '@/lib/api/orders';
import { formatPrice } from '@/lib/format-price';
import { useGuestOrders } from '@/stores/guest-orders-store';
import { statusLabels } from './order-labels';
export function OrderTrackingContent({
  publicNumber,
}: {
  publicNumber: string;
}) {
  const access = useGuestOrders((state) =>
    state.orders.find((item) => item.publicNumber === publicNumber),
  );
  const hydrated = useGuestOrders((state) => state.hydrated);
  const [order, setOrder] = useState<ApiOrderSummary | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!hydrated) return;
    if (!access) {
      queueMicrotask(() =>
        setError('کد دسترسی این سفارش در این مرورگر وجود ندارد.'),
      );
      return;
    }
    let active = true;
    const load = () =>
      getOrder(publicNumber, access.trackingToken)
        .then((value) => active && setOrder(value))
        .catch(
          (reason) =>
            active &&
            setError(
              reason instanceof Error ? reason.message : 'پیگیری ممکن نشد.',
            ),
        );
    void load();
    const timer = setInterval(load, 12_000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [access, publicNumber, hydrated]);
  if (!hydrated) return <div className="success-card order-loading" />;
  if (error)
    return (
      <div className="success-card">
        <PackageCheck />
        <h1>امکان پیگیری نیست</h1>
        <p>{error}</p>
        <Link href="/orders" className="primary-button">
          سفارش‌های من
        </Link>
      </div>
    );
  if (!order) return <div className="success-card order-loading" />;
  return (
    <div className="success-card">
      <PackageCheck className="empty-order-icon" />
      <span>پیگیری زنده</span>
      <h1>{statusLabels[order.status]}</h1>
      <p>
        <Clock3 /> وضعیت سفارش هر ۱۲ ثانیه به‌روز می‌شود.
      </p>
      <div className="order-facts order-facts-grid">
        <div>
          <small>شماره سفارش</small>
          <strong dir="ltr">{order.publicNumber}</strong>
        </div>
        <div>
          <small>مبلغ</small>
          <strong>{formatPrice(order.pricing.totalToman)}</strong>
        </div>
        <div>
          <small>نحوه دریافت</small>
          <strong>
            {order.fulfillmentType === 'delivery'
              ? 'ارسال با پیک'
              : 'دریافت حضوری'}
          </strong>
        </div>
        <div>
          <small>پرداخت</small>
          <strong>
            {order.paymentStatus === 'paid'
              ? 'پرداخت‌شده'
              : 'پرداخت هنگام دریافت'}
          </strong>
        </div>
      </div>
      <Link href="/orders" className="ghost-dark">
        همه سفارش‌ها
      </Link>
    </div>
  );
}
