'use client';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { adminApi, type AdminProfile } from '@/lib/api/admin';
type State = {
  status: 'loading' | 'authenticated' | 'unauthenticated';
  user: AdminProfile | null;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};
const AuthContext = createContext<State | null>(null);
export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<State['status']>('loading');
  const [user, setUser] = useState<AdminProfile | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const refresh = useCallback(async () => {
    setStatus('loading');
    try {
      const result = await adminApi.me();
      setUser(result.user);
      setStatus('authenticated');
    } catch {
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);
  useEffect(() => {
    if (pathname === '/admin/login') {
      queueMicrotask(() => {
        setStatus('unauthenticated');
        setUser(null);
      });
      return;
    }
    queueMicrotask(() => void refresh());
  }, [pathname, refresh]);
  const logout = async () => {
    try {
      await adminApi.logout();
    } finally {
      setUser(null);
      setStatus('unauthenticated');
      router.replace('/admin/login');
    }
  };
  const value = { status, user, refresh, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAdminAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error('AdminAuthProvider missing');
  return value;
};
export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useAdminAuth();
  const router = useRouter();
  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/admin/login');
  }, [status, router]);
  if (status === 'loading')
    return (
      <div className="admin-auth-state">
        <span className="admin-loader" />
        <strong>در حال بررسی نشست…</strong>
      </div>
    );
  if (status === 'unauthenticated') return null;
  return <>{children}</>;
}
