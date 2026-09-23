'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Heart, Plus, Star } from 'lucide-react';
import { formatPrice } from '@/data/foods';
import { useCart } from '@/stores/cart-store';
import type { Food } from '@/types/food';
export function FoodCard({food,compact=false}:{food:Food;compact?:boolean}){
  const add=useCart(s=>s.addItem);const [added,setAdded]=useState(false);
  const addFood=()=>{add(food);setAdded(true);window.setTimeout(()=>setAdded(false),1800)};
  return <article className={`food-card ${compact?'compact-card':''} ${!food.available?'unavailable':''}`}>
    <Link href={`/menu/${food.slug}`} className="food-image" style={{backgroundImage:`url(${food.image})`}}>{food.tags[0]&&<span>{food.tags[0]}</span>}<button className="favorite" aria-label={`علاقه‌مندی ${food.title}`} onClick={(e)=>e.preventDefault()}><Heart/></button>{!food.available&&<b>فعلاً ناموجود</b>}</Link>
    <div className="food-info"><div className="rating"><Star/> {food.rating.toLocaleString('fa-IR')} <small>({food.reviewsCount.toLocaleString('fa-IR')})</small></div><Link href={`/menu/${food.slug}`}><h3>{food.title}</h3></Link><p>{food.shortDescription}</p><div><strong>{formatPrice(food.price)}</strong><button disabled={!food.available} onClick={addFood} aria-label={`افزودن ${food.title}`}><Plus/></button></div></div>
    {added&&<output className="add-toast" aria-live="polite">به سبد خرید اضافه شد</output>}
  </article>
}
