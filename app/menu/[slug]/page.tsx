import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { ProductOrder } from '@/components/product/product-order';
import { ProductGallery } from '@/components/product/product-gallery';
import { FoodCard } from '@/components/menu/food-card';
import { foods } from '@/data/foods';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const food=foods.find(f=>f.slug===slug);return {title:food?`${food.title} | خانه کباب طهران`:'غذا پیدا نشد',description:food?.fullDescription,openGraph:food?{title:food.title,description:food.fullDescription,images:[food.image]}:{images:[]},twitter:food?{title:food.title,description:food.fullDescription,images:[food.image]}:{images:[]}}}
export default async function ProductPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const food=foods.find(f=>f.slug===slug);if(!food)notFound();return <main className="inner-page"><div className="container product-page"><nav className="breadcrumbs" aria-label="مسیر صفحه"><Link href="/">خانه</Link><ChevronLeft/><Link href="/menu">منو</Link><ChevronLeft/><span>{food.title}</span></nav><div className="product-grid"><ProductGallery food={food}/><ProductOrder food={food}/></div><section className="related"><div className="section-heading"><div><span>پیشنهاد ما</span><h2>شاید دوست داشته باشید</h2></div></div><div className="food-grid">{foods.filter(f=>f.id!==food.id).slice(0,3).map(f=><FoodCard key={f.id} food={f}/>)}</div></section></div></main>}
