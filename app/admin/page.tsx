'use client';
import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { adminApi, type OrderStatus } from '@/lib/api/admin';
import { formatPrice } from '@/lib/format-price';
type Dashboard = {
  today: {
    orderCount: number;
    orderValueToman: number;
    actionableCount: number;
    averageOrderToman: number;
  };
  statusSummary: { status: OrderStatus; count: number }[];
  recentOrders: {
    id: string;
    publicNumber: string;
    customerName: string;
    status: OrderStatus;
    totalToman: number;
    createdAt: string;
  }[];
};
const labels: Record<OrderStatus, string> = {
  submitted: 'جدید',
  confirmed: 'تاییدشده',
  preparing: 'در حال آماده‌سازی',
  ready: 'آماده',
  dispatched: 'ارسال‌شده',
  delivered: 'تحویل‌شده',
  cancelled: 'لغوشده',
};
export default function AdminPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData((await adminApi.dashboard()) as Dashboard);
    } catch {
      setError('داده‌های داشبورد دریافت نشد.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);
  const cards = data
    ? [
        ['سفارش‌های امروز', String(data.today.orderCount)],
        ['ارزش سفارش‌های امروز', formatPrice(data.today.orderValueToman)],
        ['سفارش‌های نیازمند اقدام', String(data.today.actionableCount)],
        ['میانگین مبلغ سفارش', formatPrice(data.today.averageOrderToman)],
      ]
    : [];
  return (
    <section className="admin-page">
      <div className="admin-title">
        <span>نمای زنده</span>
        <h1>داشبورد</h1>
        <p>خلاصه عملیات امروز به وقت تهران</p>
      </div>
      {loading ? (
        <div className="admin-loading">در حال دریافت…</div>
      ) : error ? (
        <div className="admin-error">
          {error}
          <button onClick={() => void load()}>
            <RefreshCw />
            تلاش مجدد
          </button>
        </div>
      ) : (
        data && (
          <>
            <div className="admin-stat-grid">
              {cards.map(([title, value]) => (
                <article key={title}>
                  <span>{title}</span>
                  <strong>{value}</strong>
                </article>
              ))}
            </div>
            <div className="admin-dashboard-grid">
              <section className="admin-panel">
                <h2>وضعیت سفارش‌ها</h2>
                <div className="status-grid">
                  {data.statusSummary.length ? (
                    data.statusSummary.map((x) => (
                      <div key={x.status}>
                        <span>{labels[x.status]}</span>
                        <strong>{x.count}</strong>
                      </div>
                    ))
                  ) : (
                    <p>امروز سفارشی ثبت نشده است.</p>
                  )}
                </div>
              </section>
              <section className="admin-panel">
                <h2>آخرین سفارش‌ها</h2>
                {data.recentOrders.length ? (
                  <div className="admin-list">
                    {data.recentOrders.map((o) => (
                      <div key={o.id}>
                        <span>
                          <b>{o.publicNumber}</b>
                          <small>{o.customerName}</small>
                        </span>
                        <span>
                          {formatPrice(o.totalToman)}
                          <em>{labels[o.status]}</em>
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="admin-empty">
                    <strong>هنوز سفارشی نیست</strong>
                  </div>
                )}
              </section>
            </div>
          </>
        )
      )}
    </section>
  );
}
