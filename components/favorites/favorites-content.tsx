'use client';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { FoodCard } from '@/components/menu/food-card';
import { foods } from '@/data/foods';
import { useFavorites } from '@/stores/favorites-store';
export function FavoritesContent(){const ids=useFavorites((state)=>state.ids);const selected=foods.filter((food)=>ids.includes(food.id));return selected.length?<div className="food-grid">{selected.map((food)=><FoodCard key={food.id} food={food}/>)}</div>:<div className="empty-cart page-empty"><Heart/><h2>هنوز غذایی ذخیره نکرده‌اید</h2><p>روی قلب کنار هر غذا بزنید تا اینجا نگه داشته شود.</p><Link href="/menu" className="primary-button">مشاهده منو</Link></div>}
