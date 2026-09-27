import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
export function OfferBanner() {
  return (
    <section className="container offer">
      <div className="offer-image">
        <Image
          src="/images/foods/kebab.jpg"
          alt="انتخاب‌های کباب برای سفارش دو نفره"
          fill
          sizes="(max-width: 760px) 100vw, 50vw"
        />
      </div>
      <div className="offer-copy">
        <span>برای یک وعده دونفره</span>
        <h2>انتخاب کباب و مخلفات</h2>
        <p>کباب، سالاد و نوشیدنی دلخواهتان را از منوی امروز کنار هم بچینید.</p>
        <Link href="/menu" className="primary-button">
          انتخاب از منو <ArrowLeft />
        </Link>
      </div>
    </section>
  );
}
