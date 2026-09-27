'use client';
import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
type Row = {
  id: string;
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'skipped';
  eventType: string;
  recipient: string;
  attempts: number;
  lastErrorCode: string | null;
  createdAt: string;
  sentAt: string | null;
  publicNumber: string | null;
};
const labels = {
  pending: 'در صف',
  processing: 'در حال ارسال',
  sent: 'ارسال‌شده',
  failed: 'ناموفق',
  skipped: 'ردشده',
};
export default function NotificationsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminApi.notifications<{ notifications: Row[] }>({
        status: status || undefined,
        limit: 50,
      });
      setRows(result.notifications);
    } catch {
      setMessage('فهرست پیام‌ها دریافت نشد.');
    } finally {
      setLoading(false);
    }
  }, [status]);
  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);
  const retry = async (id: string) => {
    try {
      await adminApi.retryNotification(id);
      setMessage('پیام دوباره در صف قرار گرفت.');
      await load();
    } catch {
      setMessage('تلاش مجدد ممکن نشد.');
    }
  };
  return (
    <section className="admin-page">
      <div className="admin-title">
        <span>خروجی اعلان‌ها</span>
        <h1>پیام‌های سفارش</h1>
        <p>وضعیت صف پیامک و تلاش مجدد</p>
      </div>
      <div className="admin-toolbar">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="">همه وضعیت‌ها</option>
          {Object.entries(labels).map(([value, label]) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </select>
        <button onClick={() => void load()}>
          <RefreshCw />
          تازه‌سازی
        </button>
      </div>
      {message && <div className="admin-notice">{message}</div>}
      <section className="admin-panel admin-notification-list">
        {loading ? (
          <div className="admin-loading">در حال دریافت…</div>
        ) : rows.length ? (
          rows.map((row) => (
            <article key={row.id}>
              <div>
                <strong>{row.publicNumber ?? 'بدون سفارش'}</strong>
                <small>
                  {row.eventType} · {row.recipient}
                </small>
              </div>
              <span>{labels[row.status]}</span>
              <small>{row.attempts.toLocaleString('fa-IR')} تلاش</small>
              {(row.status === 'failed' || row.status === 'skipped') && (
                <button onClick={() => void retry(row.id)}>تلاش مجدد</button>
              )}
            </article>
          ))
        ) : (
          <div className="admin-empty">پیامی با این فیلتر وجود ندارد.</div>
        )}
      </section>
    </section>
  );
}
