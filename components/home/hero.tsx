import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
export function Hero() {
  return (
    <section className="hero">
      <div className="container hero-layout">
        <div className="hero-copy">
          <span className="eyebrow">
            <i />
            از روی آتش، مستقیم برای شما
          </span>
          <h1>
            کباب داغ،
            <br />
            <em>برنج ایرانی</em>
          </h1>
          <p>
            گوشت تازه، زعفران ایرانی و پخت روزانه؛ غذای اصیلی که با خیال راحت
            برای خانواده سفارش می‌دهید.
          </p>
          <div className="hero-buttons">
            <Link className="primary-button" href="/menu">
              سفارش آنلاین <ArrowLeft />
            </Link>
            <Link className="ghost-button" href="/menu/full">
              مشاهده منو
            </Link>
          </div>
          <div className="hero-facts">
            <span>
              <CheckCircle2 />
              <small>تازه‌چرخ روزانه</small>
            </span>
            <span>
              <CheckCircle2 />
              <small>برنج ایرانی</small>
            </span>
            <span>
              <CheckCircle2 />
              <small>پخت در لحظه</small>
            </span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-image">
            <Image
              src="/images/foods/kebab.jpg"
              alt="چلوکباب ایرانی تازه با برنج زعفرانی"
              fill
              priority
              sizes="(max-width: 760px) 100vw, 55vw"
            />
          </div>
          <div className="hero-photo-card">
            <span>پیشنهاد امروز</span>
            <strong>چلوکباب سلطانی</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
