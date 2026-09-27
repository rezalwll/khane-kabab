'use client';
import Link from 'next/link';
import {
  ArrowRight,
  LayoutDashboard,
  LogOut,
  MenuSquare,
  ReceiptText,
  Settings,
  MessageSquareText,
  Activity,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from './admin-auth';
const links = [
  ['/admin', 'داشبورد', LayoutDashboard],
  ['/admin/orders', 'سفارش‌ها', ReceiptText],
  ['/admin/menu', 'منو', MenuSquare],
  ['/admin/notifications', 'پیام‌ها', MessageSquareText],
  ['/admin/system', 'وضعیت سیستم', Activity],
  ['/admin/settings', 'تنظیمات', Settings],
] as const;
export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAdminAuth();
  const pathname = usePathname();
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div>
          <span>خانه کباب طهران</span>
          <strong>پنل مدیریت</strong>
        </div>
        <nav>
          {links.map(([href, label, Icon]) => (
            <Link
              className={pathname === href ? 'active' : ''}
              href={href}
              key={href}
            >
              <Icon />
              {label}
            </Link>
          ))}
        </nav>
        <Link className="admin-back" href="/">
          <ArrowRight />
          بازگشت به سایت
        </Link>
      </aside>
      <main className="admin-main">
        <header>
          <div>
            <span>
              {user?.role === 'owner'
                ? 'مالک'
                : user?.role === 'manager'
                  ? 'مدیر'
                  : 'کارمند'}
            </span>
            <strong>{user?.displayName}</strong>
          </div>
          <button
            className="admin-logout"
            type="button"
            onClick={() => void logout()}
          >
            <LogOut />
            خروج
          </button>
        </header>
        {children}
      </main>
    </div>
  );
}
