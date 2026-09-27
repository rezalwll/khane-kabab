'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getMenu, getProduct } from '@/lib/api/menu';
import { apiProductToFood } from '@/lib/menu-adapter';
import type { Food } from '@/types/food';
import { FoodCard } from '@/components/menu/food-card';
import { ProductGallery } from './product-gallery';
import { ProductOrder } from './product-order';

export function ProductPageContent({ slug }: { slug: string }) {
  const [food, setFood] = useState<Food | null>(null);
  const [related, setRelated] = useState<Food[]>([]);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    Promise.all([getProduct(slug), getMenu()])
      .then(([product, menu]) => {
        if (!active) return;
        setError('');
        const category =
          menu.categories.find((group) =>
            group.products.some((item) => item.id === product.id),
          )?.name ?? 'منو';
        setFood(apiProductToFood(product, category));
        setRelated(
          menu.categories
            .flatMap((group) =>
              group.products.map((item) => apiProductToFood(item, group.name)),
            )
            .filter((item) => item.id !== product.id)
            .slice(0, 3),
        );
      })
      .catch(
        (reason) =>
          active &&
          setError(reason instanceof Error ? reason.message : 'غذا پیدا نشد.'),
      );
    return () => {
      active = false;
    };
  }, [slug, reload]);
  if (error)
    return (
      <main className="inner-page">
        <div className="container no-results">
          <h2>اطلاعات غذا دریافت نشد</h2>
          <p>{error}</p>
          <button type="button" onClick={() => setReload((value) => value + 1)}>
            تلاش مجدد
          </button>
        </div>
      </main>
    );
  if (!food)
    return (
      <main className="inner-page">
        <div className="container no-results">
          <h2>در حال دریافت اطلاعات غذا…</h2>
        </div>
      </main>
    );
  return (
    <main className="inner-page">
      <div className="container product-page">
        <nav className="breadcrumbs" aria-label="مسیر صفحه">
          <Link href="/">خانه</Link>
          <ChevronLeft />
          <Link href="/menu">منو</Link>
          <ChevronLeft />
          <span>{food.title}</span>
        </nav>
        <div className="product-grid">
          <ProductGallery food={food} />
          <ProductOrder food={food} />
        </div>
        {related.length > 0 && (
          <section className="related">
            <div className="section-heading">
              <div>
                <span>پیشنهاد ما</span>
                <h2>شاید دوست داشته باشید</h2>
              </div>
            </div>
            <div className="food-grid">
              {related.map((item) => (
                <FoodCard key={item.id} food={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
