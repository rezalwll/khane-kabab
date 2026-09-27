import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ExternalLink, Phone } from 'lucide-react';
import { PrintMenuButton } from '@/components/menu/print-menu-button';
import { paperMenuArchive, paperMenuSections } from '@/data/paper-menu';
import { restaurant } from '@/data/restaurant';

export const metadata: Metadata = {
  title: 'منوی کامل | خانه کباب طهران',
  description:
    'منوی کامل کباب‌ها، چلوکباب‌ها، خوراک‌ها، مخلفات و نوشیدنی‌های خانه کباب طهران',
};

export default function FullMenuPage() {
  return (
    <main className="paper-menu-page">
      <div className="container">
        <header className="paper-menu-header">
          <div className="paper-menu-brand">
            <Image
              src="/brand/logo.png"
              alt="خانه کباب طهران"
              width={96}
              height={96}
            />
            <div>
              <span>{restaurant.tagline}</span>
              <h1>منوی کامل خانه کباب طهران</h1>
              <p>
                بازآفرینی دیجیتال منوی اصلی رستوران؛ مرتب، خوانا و مناسب موبایل
                و چاپ.
              </p>
            </div>
          </div>
          <div className="paper-menu-actions">
            <Link href="/menu">
              <ArrowRight />
              بازگشت به سفارش آنلاین
            </Link>
            <PrintMenuButton />
          </div>
        </header>
        <nav className="paper-menu-nav" aria-label="دسته‌های منوی کامل">
          {paperMenuSections.map((section) => (
            <a key={section.id} href={`#${section.id}`}>
              {section.title}
            </a>
          ))}
        </nav>
        <section className="paper-menu-grid">
          {paperMenuSections.map((section) => (
            <article
              className="paper-menu-section"
              id={section.id}
              key={section.id}
            >
              <header>
                <span>✦</span>
                <h2>{section.title}</h2>
                <p>{section.description}</p>
              </header>
              <ul>
                {section.items.map((item) => (
                  <li key={`${section.id}-${item.title}`}>
                    <div>
                      <strong>{item.title}</strong>
                      {item.note && <small>{item.note}</small>}
                    </div>
                    <span>قیمت روز</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
        <aside className="paper-menu-notice">
          <strong>درباره قیمت‌ها</strong>
          <p>
            قیمت‌های منوی چاپی مربوط به نسخه قدیمی هستند و عمداً نمایش داده
            نشده‌اند. قیمت روز هنگام سفارش تلفنی یا در بخش سفارش آنلاین تأیید
            می‌شود.
          </p>
        </aside>
        <section className="paper-menu-contact">
          <div>
            <span>سفارش و هماهنگی</span>
            <h2>{restaurant.phoneLabel}</h2>
            <p>{restaurant.locationLabel}</p>
            <a href={restaurant.phoneHref}>
              <Phone />
              تماس با رستوران
            </a>
          </div>
          <div className="paper-menu-qr">
            <Image
              src="/brand/menu-qr.svg"
              alt="QR منوی دیجیتال خانه کباب طهران"
              width={112}
              height={112}
            />
            <span>اسکن کنید و منوی دیجیتال را ببینید</span>
          </div>
        </section>
        <footer className="paper-menu-archive">
          <span>منابع منوی چاپی</span>
          {paperMenuArchive.map((item) => (
            <a
              href={item.href}
              target="_blank"
              rel="noreferrer noopener"
              key={item.href}
            >
              {item.title}
              <ExternalLink />
            </a>
          ))}
        </footer>
      </div>
    </main>
  );
}
