import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
const cards = [
  ['چلوکباب', '۹ انتخاب', '/images/foods/kebab.jpg', '/menu/full#chelo-kebab'],
  ['انواع کباب', '۱۱ انتخاب', '/images/foods/chicken.jpg', '/menu/full#kebabs'],
  ['خوراک', '۹ انتخاب', '/images/foods/stew.jpg', '/menu/full#plates'],
  ['مخلفات', '۵ انتخاب', '/images/foods/salad.jpg', '/menu/full#sides'],
] as const;
export function Categories() {
  return (
    <section className="category-section">
      <div className="container">
        <div className="center-heading">
          <span>منوی اصلی رستوران</span>
          <h2>چی میل دارید؟</h2>
        </div>
        <div className="category-grid">
          {cards.map(([title, count, image, href]) => (
            <Link href={href} className="category-card" key={title}>
              <Image
                src={image}
                alt={title}
                fill
                sizes="(max-width: 760px) 50vw, 25vw"
              />
              <span>
                <strong>{title}</strong>
                <small>{count}</small>
              </span>
              <ArrowLeft />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
