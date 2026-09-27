'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, PackageCheck } from 'lucide-react';
import { formatPrice } from '@/lib/format-price';
import { getOrder, type ApiOrderSummary } from '@/lib/api/orders';
import { useGuestOrders } from '@/stores/guest-orders-store';
import { statusLabels } from './order-labels';

export function SuccessContent() {
  const [order, setOrder] = useState<ApiOrderSummary | null>(null);
  const [error, setError] = useState('');
  const orders = useGuestOrders((state) => state.orders);
  const hydrated = useGuestOrders((state) => state.hydrated);
  useEffect(() => {
    if (!hydrated) return;
    const publicNumber = new URLSearchParams(window.location.search).get(
      'order',
    );
    const access = orders.find((item) => item.publicNumber === publicNumber);
    if (!access) {
      queueMicrotask(() =>
        setError('دسترسی پیگیری این سفارش در این مرورگر پیدا نشد.'),
      );
      return;
    }
    getOrder(access.publicNumber, access.trackingToken)
      .then(setOrder)
      .catch((reason) =>
        setError(
          reason instanceof Error ? reason.message : 'سفارش دریافت نشد.',
        ),
      );
  }, [orders, hydrated]);
  if (!hydrated)
    return (
      <div
        className="success-card order-loading"
        aria-label="در حال آماده‌سازی پیگیری"
      />
    );
  if (error)
    return (
      <div className="success-card">
        <PackageCheck className="empty-order-icon" />
        <h1>سفارش قابل نمایش نیست</h1>
        <p>{error}</p>
        <Link href="/orders" className="primary-button">
          سفارش‌های من
        </Link>
      </div>
    );
  if (!order)
    return (
      <div
        className="success-card order-loading"
        aria-label="در حال دریافت سفارش"
      />
    );
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <div className="success-card">
      <div className="success-check">
        <Check />
      </div>
      <span>سفارش با موفقیت ثبت شد</span>
      <h1>سفارش شما به رستوران رسید</h1>
      <p>وضعیت جدید سفارش را در صفحه پیگیری ببینید.</p>
      <div className="order-facts order-facts-grid">
        <div>
          <small>شماره سفارش</small>
          <strong dir="ltr">{order.publicNumber}</strong>
        </div>
        <div>
          <small>تعداد اقلام</small>
          <strong>{itemCount.toLocaleString('fa-IR')} قلم</strong>
        </div>
        <div>
          <small>مبلغ نهایی</small>
          <strong>{formatPrice(order.pricing.totalToman)}</strong>
        </div>
        <div>
          <small>وضعیت</small>
          <strong>{statusLabels[order.status]}</strong>
        </div>
      </div>
      <div className="success-actions">
        <Link href={`/orders/${order.publicNumber}`} className="primary-button">
          پیگیری سفارش
        </Link>
        <Link href="/menu" className="ghost-dark">
          مشاهده منو
        </Link>
      </div>
    </div>
  );
}
