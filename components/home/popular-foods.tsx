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
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    getMenu()
      .then((menu) => {
        if (active) {
          setError(false);
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
        }
      })
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, [reload]);
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
        <div className="api-inline-state">
          <p>
            {error
              ? 'ارتباط با سامانه سفارش برقرار نیست.'
              : 'در حال دریافت پیشنهادها…'}
          </p>
          {error && (
            <button
              type="button"
              onClick={() => {
                setError(false);
                setReload((value) => value + 1);
              }}
            >
              تلاش مجدد
            </button>
          )}
        </div>
      )}
    </section>
  );
}
