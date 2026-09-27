'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { FoodCard } from '@/components/menu/food-card';
import { getMenu } from '@/lib/api/menu';
import { apiProductToFood } from '@/lib/menu-adapter';
import type { Food } from '@/types/food';
import { useFavorites } from '@/stores/favorites-store';
export function FavoritesContent() {
  const ids = useFavorites((state) => state.ids);
  const [foods, setFoods] = useState<Food[]>([]);
  useEffect(() => {
    let active = true;
    void getMenu()
      .then((menu) => {
        if (active)
          setFoods(
            menu.categories.flatMap((group) =>
              group.products.map((product) =>
                apiProductToFood(product, group.name),
              ),
            ),
          );
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  const selected = foods.filter((food) => ids.includes(food.id));
  return selected.length ? (
    <div className="food-grid">
      {selected.map((food) => (
        <FoodCard key={food.id} food={food} />
      ))}
    </div>
  ) : (
    <div className="empty-cart page-empty">
      <Heart />
      <h2>هنوز غذایی ذخیره نکرده‌اید</h2>
      <p>روی قلب کنار هر غذا بزنید تا اینجا نگه داشته شود.</p>
      <Link href="/menu" className="primary-button">
        مشاهده منو
      </Link>
    </div>
  );
}
