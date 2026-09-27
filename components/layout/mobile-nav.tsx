'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Home, ListOrdered, MenuSquare, UserRound } from 'lucide-react';
const links = [
  ['/', 'خانه', Home],
  ['/menu', 'منو', MenuSquare],
  ['/orders', 'سفارش‌ها', ListOrdered],
  ['/favorites', 'علاقه‌مندی‌ها', Heart],
  ['/account', 'حساب من', UserRound],
] as const;
export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="mobile-nav" aria-label="ناوبری موبایل">
      {links.map(([href, label, Icon]) => {
        const active =
          href === '/' ? pathname === '/' : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={active ? 'active' : ''}
            aria-current={active ? 'page' : undefined}
          >
            <Icon />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
