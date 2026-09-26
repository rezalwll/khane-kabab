'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Plus } from 'lucide-react';
import { formatPrice } from '@/lib/format-price';
import { useCart } from '@/stores/cart-store';
import { useFavorites } from '@/stores/favorites-store';
import { useToastStore } from '@/stores/toast-store';
import type { Food } from '@/types/food';

export function FoodCard({food,compact=false}:{food:Food;compact?:boolean}){
  const addItem=useCart((state)=>state.addItem); const toggleFavorite=useFavorites((state)=>state.toggleFavorite);
  const favorite=useFavorites((state)=>state.ids.includes(food.id)); const showToast=useToastStore((state)=>state.show);
  const addFood=()=>{addItem(food);showToast(`${food.title} به سبد خرید اضافه شد`)};
  const toggle=()=>{toggleFavorite(food.id);showToast(favorite?'از علاقه‌مندی‌ها حذف شد':'به علاقه‌مندی‌ها اضافه شد')};
  return <article className={`food-card ${compact?'compact-card':''} ${!food.available?'unavailable':''}`}>
    <div className="food-media"><Link href={`/menu/${food.slug}`} className="food-image" aria-label={`مشاهده ${food.title}`}><Image src={food.image} alt={food.title} fill sizes="(max-width: 640px) 42vw, (max-width: 1000px) 45vw, 360px"/>{food.tags[0]&&<span>{food.tags[0]}</span>}{!food.available&&<b>فعلاً ناموجود</b>}</Link><button type="button" className={`favorite ${favorite?'active':''}`} aria-label={`${favorite?'حذف از':'افزودن به'} علاقه‌مندی‌ها: ${food.title}`} aria-pressed={favorite} onClick={toggle}><Heart/></button></div>
    <div className="food-info"><Link href={`/menu/${food.slug}`}><h3>{food.title}</h3></Link><p>{food.shortDescription}</p><div><strong>{formatPrice(food.price)}</strong><button type="button" disabled={!food.available} onClick={addFood} aria-label={`افزودن ${food.title} به سبد`}><Plus/></button></div></div>
  </article>;
}
