import type { Metadata } from 'next';
import { AdminLayoutClient } from '@/components/admin/admin-layout-client';
import './admin.css';
import './admin-live.css';
export const metadata: Metadata = {
  title: 'پنل مدیریت | خانه کباب طهران',
  robots: { index: false, follow: false },
};
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
