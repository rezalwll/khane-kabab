import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { MenuBrowser } from '@/components/menu/menu-browser';
export const metadata: Metadata = { title: 'منوی خانه کباب طهران' };
export default function MenuPage() {
  return (
    <main className="inner-page">
      <section className="menu-hero">
        <div className="container menu-hero-shell">
          <div className="menu-hero-copy">
            <span className="menu-hero-eyebrow">
              <i />
              تازه از آشپزخانه
            </span>
            <h1>
              منوی امروز،
              <br />
              <em>پر از طعم ایرانی</em>
            </h1>
            <p>
              از کباب‌های داغ و جوجه زعفرانی تا چلوهای ایرانی؛ غذای موردعلاقه‌تان
              را انتخاب کنید.
            </p>
            <div className="menu-hero-facts">
              <span>
                <i />
                پخت روزانه
              </span>
              <span>
                <i />
                مواد تازه
              </span>
              <span>
                <i />
                ارسال گرم
              </span>
            </div>
            <Link className="paper-menu-link" href="/menu/full">
              مشاهده منوی کامل رستوران <ArrowLeft />
            </Link>
          </div>
          <div className="menu-hero-gallery">
            <div className="menu-hero-main-photo">
              <Image
                src="/images/foods/kebab.jpg"
                alt="چلوکباب ایرانی"
                fill
                priority
                sizes="(max-width: 900px) 70vw, 40vw"
              />
            </div>
            <div className="menu-hero-side">
              <div>
                <Image
                  src="/images/foods/chicken.jpg"
                  alt="جوجه کباب زعفرانی"
                  fill
                  sizes="(max-width: 900px) 30vw, 20vw"
                />
              </div>
              <div>
                <Image
                  src="/images/foods/rice.jpg"
                  alt="زرشک‌پلو ایرانی"
                  fill
                  sizes="(max-width: 900px) 30vw, 20vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="container menu-section">
        <MenuBrowser />
      </section>
    </main>
  );
}
