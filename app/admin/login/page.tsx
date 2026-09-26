'use client';
import { useState } from 'react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/shared/logo';
import { adminApi } from '@/lib/api/admin';
import { useAdminAuth } from '@/components/admin/admin-auth';
export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refresh } = useAdminAuth();
  async function submit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await adminApi.login(username, password);
      await refresh();
      router.replace('/admin');
    } catch {
      setError('نام کاربری یا رمز عبور نادرست است.');
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="admin-login">
      <section>
        <Logo />
        <div>
          <span>محیط امن مدیریت</span>
          <h1>ورود به پنل</h1>
          <p>برای مدیریت سفارش‌ها و منو وارد شوید.</p>
        </div>
        <form onSubmit={submit}>
          <label>
            نام کاربری
            <input
              autoComplete="username"
              maxLength={64}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label>
            رمز عبور
            <span className="password-field">
              <input
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label="نمایش رمز"
              >
                {show ? <EyeOff /> : <Eye />}
              </button>
            </span>
          </label>
          {error && (
            <div className="admin-form-error" role="alert">
              {error}
            </div>
          )}
          <button className="admin-primary" disabled={loading}>
            {loading ? (
              <>
                <LoaderCircle className="spin" />
                در حال ورود…
              </>
            ) : (
              'ورود امن'
            )}
          </button>
        </form>
      </section>
    </main>
  );
}
