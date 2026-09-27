'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ShoppingBag, UserRound } from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { useCart } from '@/stores/cart-store';

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const items = useCart((state) => state.items);
  const setDrawerOpen = useCart((state) => state.setDrawerOpen);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const active = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);
  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container header-inner">
        <Logo />
        <nav className="desktop-nav" aria-label="منوی اصلی">
          <Link className={active('/') ? 'active' : ''} href="/">
            خانه
          </Link>
          <Link className={active('/menu') ? 'active' : ''} href="/menu">
            منو
          </Link>
          <Link href="/#about">داستان ما</Link>
          <Link href="/#footer">تماس با ما</Link>
        </nav>
        <div className="header-actions">
          <Link
            className="round-action search-action"
            href="/menu?search="
            aria-label="جستجوی غذا"
          >
            <Search size={20} />
          </Link>
          <Link
            className="round-action user-action"
            href="/account"
            aria-label="حساب کاربری"
          >
            <UserRound size={20} />
          </Link>
          <button
            type="button"
            className="cart-icon"
            aria-label={`سبد خرید، ${count.toLocaleString('fa-IR')} قلم`}
            onClick={() => setDrawerOpen(true)}
          >
            <ShoppingBag size={20} />
            {count > 0 && <b>{count.toLocaleString('fa-IR')}</b>}
          </button>
          <Link className="primary-button compact" href="/menu">
            سفارش آنلاین
          </Link>
        </div>
      </div>
    </header>
  );
}
