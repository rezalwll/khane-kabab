'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Camera as Instagram, MapPin, Phone } from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { getRestaurant, type ApiRestaurant } from '@/lib/api/restaurant';
export function Footer() {
  const [restaurant, setRestaurant] = useState<ApiRestaurant | null>(null);
  useEffect(() => {
    let active = true;
    void getRestaurant()
      .then((result) => active && setRestaurant(result.restaurant))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  return (
    <footer id="footer" className="footer">
      <div className="container footer-grid">
        <div>
          <Logo />
          <p>برنج ایرانی، گوشت تازه و پخت روزانه.</p>
        </div>
        <div>
          <h3>دسترسی سریع</h3>
          <Link href="/menu">سفارش آنلاین</Link>
          <Link href="/menu/full">منوی کامل و چاپی</Link>
          <Link href="/favorites">علاقه‌مندی‌ها</Link>
          <Link href="/orders">سفارش‌های من</Link>
        </div>
        <div>
          <h3>ارتباط با ما</h3>
          {restaurant && (
            <a href={`tel:${restaurant.phone}`}>
              <Phone size={16} />
              <span>{restaurant.phone}</span>
            </a>
          )}
          {restaurant && (
            <span>
              <MapPin size={16} />
              {restaurant.city}
            </span>
          )}
          {restaurant?.instagram && (
            <a
              href={`https://instagram.com/${restaurant.instagram.replace(/^@/, '')}`}
              target="_blank"
              rel="noreferrer noopener"
            >
              <Instagram size={16} />
              <span dir="ltr">{restaurant.instagram}</span>
            </a>
          )}
        </div>
      </div>
      <div className="container copyright">© ۱۴۰۵ خانه کباب طهران</div>
    </footer>
  );
}
