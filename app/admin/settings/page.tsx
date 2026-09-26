'use client';
import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '@/lib/api/admin';
type Settings = {
  restaurantName: string;
  phone: string;
  instagram: string;
  city: string;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  defaultDeliveryFeeToman: number;
  minimumOrderToman: number | null;
  ordersEnabled: boolean;
};
type Hours = {
  dayOfWeek: number;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
};
const days = [
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه',
  'شنبه',
];
export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [hours, setHours] = useState<Hours[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
  });
  const load = useCallback(async () => {
    try {
      const [s, h] = await Promise.all([
        adminApi.settings<{ settings: Settings }>(),
        adminApi.openingHours<{ openingHours: Hours[] }>(),
      ]);
      setSettings(s.settings);
      const current = h.openingHours;
      setHours(
        Array.from(
          { length: 7 },
          (_, day) =>
            current.find((x) => x.dayOfWeek === day) ?? {
              dayOfWeek: day,
              openTime: null,
              closeTime: null,
              isClosed: true,
            },
        ),
      );
    } catch {
      setMessage('تنظیمات دریافت نشد.');
    }
  }, []);
  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);
  async function saveSettings(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!settings) return;
    setBusy(true);
    try {
      const r = await adminApi.updateSettings<{ settings: Settings }>(settings);
      setSettings(r.settings);
      setMessage('تنظیمات رستوران ذخیره شد.');
    } catch {
      setMessage('ذخیره تنظیمات ناموفق بود.');
    } finally {
      setBusy(false);
    }
  }
  async function saveHours() {
    setBusy(true);
    try {
      const r = await adminApi.updateOpeningHours<{ openingHours: Hours[] }>(
        hours,
      );
      setHours(r.openingHours);
      setMessage('ساعات کاری ذخیره شد.');
    } catch {
      setMessage(
        'بازه‌های زمانی را بررسی کنید؛ ساعت پایان باید بعد از شروع باشد.',
      );
    } finally {
      setBusy(false);
    }
  }
  async function changePassword(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      await adminApi.changePassword(
        passwords.currentPassword,
        passwords.newPassword,
      );
      setPasswords({ currentPassword: '', newPassword: '' });
      setMessage('رمز عبور تغییر کرد و نشست‌های دیگر بسته شدند.');
    } catch {
      setMessage(
        'تغییر رمز ناموفق بود؛ رمز فعلی و حداقل ۱۲ نویسه را بررسی کنید.',
      );
    } finally {
      setBusy(false);
    }
  }
  if (!settings)
    return (
      <section className="admin-page">
        <div className="admin-loading">{message || 'در حال دریافت…'}</div>
      </section>
    );
  return (
    <section className="admin-page">
      <div className="admin-title">
        <span>کنترل عملیات</span>
        <h1>تنظیمات</h1>
        <p>اطلاعات عمومی، وضعیت سفارش‌گیری و امنیت حساب</p>
      </div>
      {message && <div className="admin-notice">{message}</div>}
      <form className="admin-panel admin-settings-form" onSubmit={saveSettings}>
        <h2>اطلاعات رستوران</h2>
        <div className="form-grid">
          <label>
            نام رستوران
            <input
              value={settings.restaurantName}
              onChange={(e) =>
                setSettings({ ...settings, restaurantName: e.target.value })
              }
            />
          </label>
          <label>
            تلفن
            <input
              value={settings.phone}
              onChange={(e) =>
                setSettings({ ...settings, phone: e.target.value })
              }
            />
          </label>
          <label>
            اینستاگرام
            <input
              value={settings.instagram}
              onChange={(e) =>
                setSettings({ ...settings, instagram: e.target.value })
              }
            />
          </label>
          <label>
            شهر
            <input
              value={settings.city}
              onChange={(e) =>
                setSettings({ ...settings, city: e.target.value })
              }
            />
          </label>
          <label>
            هزینه ارسال تومان
            <input
              type="number"
              min="0"
              value={settings.defaultDeliveryFeeToman}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defaultDeliveryFeeToman: Number(e.target.value),
                })
              }
            />
          </label>
          <label>
            حداقل سفارش تومان
            <input
              type="number"
              min="0"
              value={settings.minimumOrderToman ?? ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  minimumOrderToman:
                    e.target.value === '' ? null : Number(e.target.value),
                })
              }
            />
          </label>
          <div className="check-row wide">
            <label>
              <input
                type="checkbox"
                checked={settings.ordersEnabled}
                onChange={(e) =>
                  setSettings({ ...settings, ordersEnabled: e.target.checked })
                }
              />
              سفارش‌گیری فعال
            </label>
            <label>
              <input
                type="checkbox"
                checked={settings.deliveryEnabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    deliveryEnabled: e.target.checked,
                  })
                }
              />
              ارسال فعال
            </label>
            <label>
              <input
                type="checkbox"
                checked={settings.pickupEnabled}
                onChange={(e) =>
                  setSettings({ ...settings, pickupEnabled: e.target.checked })
                }
              />
              حضوری فعال
            </label>
          </div>
        </div>
        <button className="admin-primary" disabled={busy}>
          ذخیره تنظیمات
        </button>
      </form>
      <section className="admin-panel">
        <h2>ساعات کاری</h2>
        <p className="section-note">
          ساعتی از پیش فرض نشده؛ هر روز را براساس اطلاعات واقعی تنظیم کنید.
        </p>
        <div className="hours-grid">
          {hours.map((h, index) => (
            <div key={h.dayOfWeek}>
              <strong>{days[h.dayOfWeek]}</strong>
              <label>
                <input
                  type="checkbox"
                  checked={h.isClosed}
                  onChange={(e) =>
                    setHours(
                      hours.map((x, i) =>
                        i === index ? { ...x, isClosed: e.target.checked } : x,
                      ),
                    )
                  }
                />
                تعطیل
              </label>
              <input
                aria-label="ساعت بازشدن"
                type="time"
                disabled={h.isClosed}
                value={h.openTime ?? ''}
                onChange={(e) =>
                  setHours(
                    hours.map((x, i) =>
                      i === index
                        ? { ...x, openTime: e.target.value || null }
                        : x,
                    ),
                  )
                }
              />
              <span>تا</span>
              <input
                aria-label="ساعت بسته‌شدن"
                type="time"
                disabled={h.isClosed}
                value={h.closeTime ?? ''}
                onChange={(e) =>
                  setHours(
                    hours.map((x, i) =>
                      i === index
                        ? { ...x, closeTime: e.target.value || null }
                        : x,
                    ),
                  )
                }
              />
            </div>
          ))}
        </div>
        <button
          className="admin-primary"
          disabled={busy}
          onClick={() => void saveHours()}
        >
          ذخیره ساعات
        </button>
      </section>
      <form className="admin-panel password-form" onSubmit={changePassword}>
        <h2>تغییر رمز عبور</h2>
        <p className="section-note">
          پس از تغییر، همه نشست‌های دیگر بسته می‌شوند.
        </p>
        <div className="form-grid">
          <label>
            رمز فعلی
            <input
              type="password"
              autoComplete="current-password"
              value={passwords.currentPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, currentPassword: e.target.value })
              }
            />
          </label>
          <label>
            رمز جدید
            <input
              type="password"
              minLength={12}
              autoComplete="new-password"
              value={passwords.newPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, newPassword: e.target.value })
              }
            />
          </label>
        </div>
        <button className="admin-primary" disabled={busy}>
          تغییر رمز
        </button>
      </form>
    </section>
  );
}
