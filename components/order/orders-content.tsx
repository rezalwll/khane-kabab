'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock3, PackageCheck } from 'lucide-react';
import { formatPrice } from '@/lib/format-price';
import { getOrder, type ApiOrderSummary } from '@/lib/api/orders';
import { useGuestOrders } from '@/stores/guest-orders-store';
import { statusLabels } from './order-labels';

export function OrdersContent() {
  const access = useGuestOrders((state) => state.orders);
  const hydrated = useGuestOrders((state) => state.hydrated);
  const [orders, setOrders] = useState<ApiOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    if (!hydrated) return;
    let active = true;
    void Promise.allSettled(
      access.map((item) => getOrder(item.publicNumber, item.trackingToken)),
    )
      .then((results) => {
        if (active) {
          setError(results.some((result) => result.status === 'rejected'));
          setOrders(
            results.flatMap((result) =>
              result.status === 'fulfilled' ? [result.value] : [],
            ),
          );
        }
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [access, hydrated, reload]);
  if (loading)
    return (
      <div
        className="mock-order order-loading"
        aria-label="در حال بارگذاری سفارش"
      />
    );
  if (!orders.length)
    return (
      <div className="empty-cart page-empty">
        <PackageCheck />
        <h2>
          {error
            ? 'ارتباط با سامانه سفارش برقرار نیست.'
            : 'هنوز سفارشی ثبت نکرده‌اید'}
        </h2>
        {error ? (
          <button
            type="button"
            className="primary-button"
            onClick={() => {
              setLoading(true);
              setReload((value) => value + 1);
            }}
          >
            تلاش مجدد
          </button>
        ) : (
          <>
            <p>سفارش‌های واقعی این مرورگر اینجا نمایش داده می‌شوند.</p>
            <Link href="/menu" className="primary-button">
              مشاهده منو
            </Link>
          </>
        )}
      </div>
    );
  return (
    <section>
      <h2 className="last-order-title">سفارش‌های من</h2>
      {orders.map((order) => {
        const created = new Intl.DateTimeFormat('fa-IR', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(new Date(order.createdAt));
        const count = order.items.reduce((sum, item) => sum + item.quantity, 0);
        return (
          <article className="mock-order" key={order.publicNumber}>
            <header>
              <div>
                <small>شماره سفارش</small>
                <strong dir="ltr">{order.publicNumber}</strong>
              </div>
              <span>
                <Clock3 />
                {statusLabels[order.status]}
              </span>
            </header>
            <div className="order-snapshot-body">
              <PackageCheck />
              <div>
                <strong>{count.toLocaleString('fa-IR')} قلم</strong>
                <small>{created}</small>
                <ul>
                  {order.items.map((item) => (
                    <li key={`${item.title}-${item.quantity}`}>
                      {item.title} × {item.quantity.toLocaleString('fa-IR')}
                    </li>
                  ))}
                </ul>
              </div>
              <b>{formatPrice(order.pricing.totalToman)}</b>
            </div>
            <footer>
              <small>اطلاعات زنده از سرور</small>
              <Link href={`/orders/${order.publicNumber}`}>پیگیری سفارش</Link>
            </footer>
          </article>
        );
      })}
    </section>
  );
}
