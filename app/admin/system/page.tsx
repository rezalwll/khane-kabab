'use client';
import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
type Capability = {
  provider: string;
  configured: boolean;
  enabled: boolean;
  effectiveEnabled: boolean;
};
type SystemStatus = {
  backend: {
    apiReachable: boolean;
    databaseReady: boolean;
    version: string;
    gitSha: string;
  };
  ordering: {
    ordersEnabled: boolean;
    deliveryEnabled: boolean;
    pickupEnabled: boolean;
  } | null;
  payment: Capability;
  sms: Capability;
  notifications: {
    pending: number;
    failed: number;
    workerLastSeenAt: string | null;
  };
};
const yesNo = (value: boolean) => (value ? 'فعال' : 'غیرفعال');
export default function SystemPage() {
  const [data, setData] = useState<SystemStatus | null>(null);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    try {
      setData(await adminApi.system<SystemStatus>());
      setError('');
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'وضعیت سیستم دریافت نشد.',
      );
    }
  }, []);
  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);
  return (
    <section className="admin-page">
      <div className="admin-title">
        <span>پایش عملیات</span>
        <h1>وضعیت سیستم</h1>
        <p>اطلاعات ایمن و غیرمحرمانه اجزای عملیاتی</p>
      </div>
      <div className="admin-toolbar">
        <button onClick={() => void load()}>
          <RefreshCw />
          تازه‌سازی
        </button>
      </div>
      {error && <div className="admin-notice">{error}</div>}
      {!data && !error ? (
        <div className="admin-loading">در حال دریافت…</div>
      ) : (
        data && (
          <div className="system-grid">
            <SystemCard
              title="بک‌اند"
              rows={[
                ['API', yesNo(data.backend.apiReachable)],
                ['دیتابیس', data.backend.databaseReady ? 'آماده' : 'ناآماده'],
                ['نسخه', data.backend.version],
                ['Git SHA', data.backend.gitSha],
              ]}
            />
            <SystemCard
              title="سفارش‌گیری"
              rows={[
                ['سفارش', yesNo(data.ordering?.ordersEnabled ?? false)],
                ['ارسال', yesNo(data.ordering?.deliveryEnabled ?? false)],
                ['حضوری', yesNo(data.ordering?.pickupEnabled ?? false)],
              ]}
            />
            <SystemCard
              title="پرداخت و پیامک"
              rows={[
                [
                  'درگاه',
                  `${data.payment.provider} · ${data.payment.effectiveEnabled ? 'فعال' : 'متصل نیست'}`,
                ],
                [
                  'پیامک',
                  `${data.sms.provider} · ${data.sms.effectiveEnabled ? 'فعال' : 'متصل نیست'}`,
                ],
              ]}
            />
            <SystemCard
              title="صف اعلان‌ها"
              rows={[
                [
                  'در انتظار',
                  data.notifications.pending.toLocaleString('fa-IR'),
                ],
                ['ناموفق', data.notifications.failed.toLocaleString('fa-IR')],
                [
                  'آخرین نبض worker',
                  data.notifications.workerLastSeenAt
                    ? new Intl.DateTimeFormat('fa-IR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      }).format(new Date(data.notifications.workerLastSeenAt))
                    : 'هنوز ثبت نشده',
                ],
              ]}
            />
          </div>
        )
      )}
    </section>
  );
}
function SystemCard({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <article className="admin-panel">
      <h2>{title}</h2>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
