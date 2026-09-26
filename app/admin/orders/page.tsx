'use client';
import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, X } from 'lucide-react';
import { adminApi, type OrderStatus } from '@/lib/api/admin';
import { formatPrice } from '@/lib/format-price';
type Row = {
  id: string;
  publicNumber: string;
  customerName: string;
  mobile: string;
  status: OrderStatus;
  fulfillmentType: 'delivery' | 'pickup';
  totalToman: number;
  createdAt: string;
};
type Detail = Row & {
  address?: string;
  plaque?: string;
  unit?: string;
  addressNote?: string;
  customerNote?: string;
  subtotalToman: number;
  discountToman: number;
  deliveryFeeToman: number;
  items: {
    id: string;
    productTitleSnapshot: string;
    quantity: number;
    lineTotalToman: number;
    note?: string;
    options: {
      id: string;
      optionNameSnapshot: string;
      priceDeltaToman: number;
    }[];
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
const tabs: [string, OrderStatus | undefined][] = [
  ['همه', undefined],
  ...Object.entries(labels).map(
    ([k, v]) => [v, k as OrderStatus] as [string, OrderStatus],
  ),
];
function actions(order: Detail): [OrderStatus, string][] {
  if (order.status === 'submitted')
    return [
      ['confirmed', 'تایید'],
      ['cancelled', 'لغو'],
    ];
  if (order.status === 'confirmed')
    return [
      ['preparing', 'شروع آماده‌سازی'],
      ['cancelled', 'لغو'],
    ];
  if (order.status === 'preparing')
    return [
      ['ready', 'آماده شد'],
      ['cancelled', 'لغو'],
    ];
  if (order.status === 'ready')
    return order.fulfillmentType === 'delivery'
      ? [['dispatched', 'ارسال شد']]
      : [['delivered', 'تحویل شد']];
  if (order.status === 'dispatched') return [['delivered', 'تحویل شد']];
  return [];
}
export default function OrdersPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState<OrderStatus>();
  const [q, setQ] = useState('');
  const [fulfillment, setFulfillment] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [selected, setSelected] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const load = useCallback(async () => {
    setLoading(true);
    setMessage('');
    try {
      const r = await adminApi.orders<{
        orders: Row[];
        pagination: { totalPages: number };
      }>({
        page,
        limit: 20,
        status,
        q: q || undefined,
        fulfillmentType: fulfillment || undefined,
      });
      setRows(r.orders);
      setPages(Math.max(1, r.pagination.totalPages));
    } catch {
      setMessage('دریافت سفارش‌ها ناموفق بود.');
    } finally {
      setLoading(false);
    }
  }, [page, status, q, fulfillment]);
  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);
  async function open(id: string) {
    setBusy(true);
    try {
      const r = await adminApi.order<{ order: Detail }>(id);
      setSelected(r.order);
    } catch {
      setMessage('جزئیات سفارش دریافت نشد.');
    } finally {
      setBusy(false);
    }
  }
  async function transition(next: OrderStatus) {
    if (!selected) return;
    if (next === 'cancelled' && !confirm('از لغو سفارش مطمئنید؟')) return;
    setBusy(true);
    try {
      await adminApi.updateOrderStatus(selected.id, next, selected.status);
      await open(selected.id);
      await load();
      setMessage('وضعیت سفارش به‌روز شد.');
    } catch {
      setMessage('تغییر وضعیت ممکن نشد؛ داده‌ها را تازه کنید.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="admin-page">
      <div className="admin-title">
        <span>عملیات سفارش</span>
        <h1>سفارش‌ها</h1>
        <p>پیگیری و تغییر وضعیت با ثبت تاریخچه</p>
      </div>
      <div className="admin-toolbar">
        <input
          placeholder="جست‌وجوی شماره، نام یا موبایل"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
        />
        <select
          value={fulfillment}
          onChange={(e) => setFulfillment(e.target.value)}
        >
          <option value="">همه روش‌ها</option>
          <option value="delivery">ارسال</option>
          <option value="pickup">حضوری</option>
        </select>
        <button onClick={() => void load()}>
          <RefreshCw />
          تازه‌سازی
        </button>
      </div>
      <div className="admin-tabs">
        {tabs.map(([label, value]) => (
          <button
            key={label}
            onClick={() => {
              setStatus(value);
              setPage(1);
            }}
            className={status === value ? 'active' : ''}
          >
            {label}
          </button>
        ))}
      </div>
      {message && <div className="admin-notice">{message}</div>}
      <section className="admin-panel admin-order-table">
        <header>
          <span>شماره</span>
          <span>مشتری</span>
          <span>روش</span>
          <span>مبلغ</span>
          <span>وضعیت</span>
        </header>
        {loading ? (
          <div className="admin-loading">در حال دریافت…</div>
        ) : rows.length ? (
          rows.map((o) => (
            <button
              className="order-row"
              key={o.id}
              onClick={() => void open(o.id)}
            >
              <b>{o.publicNumber}</b>
              <span>
                {o.customerName}
                <small>{o.mobile}</small>
              </span>
              <span>
                {o.fulfillmentType === 'delivery' ? 'ارسال' : 'حضوری'}
              </span>
              <span>{formatPrice(o.totalToman)}</span>
              <em data-status={o.status}>{labels[o.status]}</em>
            </button>
          ))
        ) : (
          <div className="admin-empty">
            <strong>سفارشی با این فیلتر نیست</strong>
          </div>
        )}
        <footer>
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronRight />
          </button>
          <span>
            صفحه {page} از {pages}
          </span>
          <button
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronLeft />
          </button>
        </footer>
      </section>
      {selected && (
        <dialog open className="admin-overlay">
          <aside className="admin-live-drawer">
            <header>
              <div>
                <span>{selected.publicNumber}</span>
                <h2>{selected.customerName}</h2>
              </div>
              <button onClick={() => setSelected(null)}>
                <X />
              </button>
            </header>
            <div className="detail-meta">
              <span>{selected.mobile}</span>
              <span>
                {selected.fulfillmentType === 'delivery'
                  ? 'ارسال با پیک'
                  : 'دریافت حضوری'}
              </span>
              <em>{labels[selected.status]}</em>
            </div>
            {selected.address && (
              <p className="address">
                {selected.address}{' '}
                {selected.plaque && `، پلاک ${selected.plaque}`}{' '}
                {selected.unit && `، واحد ${selected.unit}`}
              </p>
            )}
            <div className="order-items">
              {selected.items.map((item) => (
                <article key={item.id}>
                  <strong>
                    {item.quantity} × {item.productTitleSnapshot}
                  </strong>
                  <span>{formatPrice(item.lineTotalToman)}</span>
                  {item.options.map((o) => (
                    <small key={o.id}>
                      {o.optionNameSnapshot} (+{formatPrice(o.priceDeltaToman)})
                    </small>
                  ))}
                  {item.note && <small>یادداشت: {item.note}</small>}
                </article>
              ))}
            </div>
            <div className="totals">
              <span>
                جمع اقلام <b>{formatPrice(selected.subtotalToman)}</b>
              </span>
              <span>
                تخفیف <b>{formatPrice(selected.discountToman)}</b>
              </span>
              <span>
                ارسال <b>{formatPrice(selected.deliveryFeeToman)}</b>
              </span>
              <strong>
                مبلغ نهایی <b>{formatPrice(selected.totalToman)}</b>
              </strong>
            </div>
            {selected.customerNote && (
              <p>یادداشت مشتری: {selected.customerNote}</p>
            )}
            <footer className="status-actions">
              {actions(selected).map(([next, label]) => (
                <button
                  className={next === 'cancelled' ? 'danger' : 'admin-primary'}
                  disabled={busy}
                  key={next}
                  onClick={() => void transition(next)}
                >
                  {label}
                </button>
              ))}
            </footer>
          </aside>
        </dialog>
      )}
    </section>
  );
}
