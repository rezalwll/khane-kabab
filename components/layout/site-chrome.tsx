'use client';
import { usePathname } from 'next/navigation';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { MobileNav } from '@/components/layout/mobile-nav';
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return children;
  return (
    <>
      <Header />
      {children}
      <Footer />
      <MobileNav />
      <CartDrawer />
    </>
  );
}
