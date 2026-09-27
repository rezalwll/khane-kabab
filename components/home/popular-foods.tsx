'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { FoodCard } from '@/components/menu/food-card';
import { getMenu } from '@/lib/api/menu';
import { apiProductToFood } from '@/lib/menu-adapter';
import type { Food } from '@/types/food';
export function PopularFoods() {
  const [foods, setFoods] = useState<Food[]>([]);
  useEffect(() => {
    let active = true;
    getMenu()
      .then((menu) => {
        if (active)
          setFoods(
            menu.categories
              .flatMap((group) =>
                group.products.map((product) =>
                  apiProductToFood(product, group.name),
                ),
              )
              .filter((food) => food.featured)
              .slice(0, 6),
          );
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  return (
    <section className="section container">
      <div className="section-heading">
        <div>
          <span>انتخاب‌های پیشنهادی</span>
          <h2>پیشنهادهای خانه کباب</h2>
          <p>چند انتخاب متنوع برای شروع سفارش</p>
        </div>
        <Link href="/menu">
          مشاهده همه <ArrowLeft />
        </Link>
      </div>
      {foods.length > 0 ? (
        <div className="food-grid">
          {foods.map((food) => (
            <FoodCard key={food.id} food={food} />
          ))}
        </div>
      ) : (
        <p className="api-inline-state">
          پیشنهادها پس از دریافت منو نمایش داده می‌شوند.
        </p>
      )}
    </section>
  );
}
