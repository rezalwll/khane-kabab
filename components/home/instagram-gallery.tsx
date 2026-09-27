import Image from 'next/image';
import { Camera as Instagram } from 'lucide-react';
import { foods } from '@/data/foods';
import { restaurant } from '@/data/restaurant';
export function InstagramGallery() {
  return (
    <section className="instagram-section">
      <div className="container">
        <div className="section-heading">
          <div>
            <span>
              <Instagram /> خانه کباب در اینستاگرام
            </span>
            <h2 dir="ltr">{restaurant.instagramLabel}</h2>
          </div>
          <a
            href={restaurant.instagramHref}
            target="_blank"
            rel="noreferrer noopener"
          >
            دنبال کنید
          </a>
        </div>
        <div className="insta-grid">
          {foods.slice(0, 5).map((food) => (
            <a
              key={food.id}
              href={restaurant.instagramHref}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`مشاهده اینستاگرام، تصویر ${food.title}`}
            >
              <Image
                src={food.image}
                alt={food.title}
                fill
                sizes="(max-width: 760px) 33vw, 20vw"
              />
              <Instagram />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
