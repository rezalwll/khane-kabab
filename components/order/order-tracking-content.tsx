'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  const inFlight = useRef(false);
  const load = useCallback(async () => {
    if (!access || inFlight.current) return;
    inFlight.current = true;
    try {
      const value = await getOrder(publicNumber, access.trackingToken);
      setOrder(value);
      setError('');
    } catch {
      setError('ارتباط با سامانه سفارش برقرار نیست.');
    } finally {
      inFlight.current = false;
    }
  }, [access, publicNumber]);
  useEffect(() => {
    if (!hydrated) return;
    if (!access) {
      queueMicrotask(() =>
        setError('کد دسترسی این سفارش در این مرورگر وجود ندارد.'),
      );
      return;
    }
    queueMicrotask(() => void load());
    const timer = setInterval(() => {
      if (
        document.visibilityState === 'visible' &&
        order?.status !== 'delivered' &&
        order?.status !== 'cancelled'
      )
        void load();
    }, 12_000);
    const visible = () => {
      if (document.visibilityState === 'visible') void load();
    };
    document.addEventListener('visibilitychange', visible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', visible);
    };
  }, [access, hydrated, load, order?.status]);
  if (!hydrated) return <div className="success-card order-loading" />;
  if (error && !order)
    return (
      <div className="success-card">
        <PackageCheck />
        <h1>امکان پیگیری نیست</h1>
        <p>{error}</p>
        <button
          type="button"
          className="primary-button"
          onClick={() => void load()}
        >
          تلاش مجدد
        </button>
        <Link href="/orders" className="ghost-dark">
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
      {error && (
        <p className="field-error">
          ارتباط موقتاً قطع است؛ آخرین وضعیت نمایش داده می‌شود.
        </p>
      )}
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
      <button type="button" className="ghost-dark" onClick={() => void load()}>
        تازه‌سازی
      </button>
      <Link href="/orders" className="ghost-dark">
        همه سفارش‌ها
      </Link>
    </div>
  );
}
