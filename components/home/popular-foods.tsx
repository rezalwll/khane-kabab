import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { FoodCard } from '@/components/menu/food-card';
import { foods } from '@/data/foods';
export function PopularFoods(){return <section className="section container"><div className="section-heading"><div><span>انتخاب‌های پیشنهادی</span><h2>پیشنهادهای خانه کباب</h2><p>چند انتخاب متنوع برای شروع سفارش</p></div><Link href="/menu">مشاهده همه <ArrowLeft/></Link></div><div className="food-grid">{foods.filter((food)=>food.featured).slice(0,6).map((food)=><FoodCard key={food.id} food={food}/>)}</div></section>}
