'use client';
import { usePathname } from 'next/navigation';
import { AdminAuthGuard, AdminAuthProvider } from './admin-auth';
import { AdminShell } from './admin-shell';
export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AdminAuthProvider>
      {pathname === '/admin/login' ? (
        children
      ) : (
        <AdminAuthGuard>
          <AdminShell>{children}</AdminShell>
        </AdminAuthGuard>
      )}
    </AdminAuthProvider>
  );
}
