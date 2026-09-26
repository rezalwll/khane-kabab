'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { categories, foods } from '@/data/foods';
import { FoodCard } from './food-card';
type MenuFilter='all'|'featured'|'available';
const normalize=(value:string)=>value.trim().replace(/ي/g,'ی').replace(/ك/g,'ک').toLocaleLowerCase('fa-IR');

export function MenuBrowser(){
  const [query,setQuery]=useState(''); const [category,setCategory]=useState<(typeof categories)[number]>('همه'); const [filter,setFilter]=useState<MenuFilter>('all');
  const searchRef=useRef<HTMLInputElement>(null); const activeTab=useRef<HTMLButtonElement>(null);
  useEffect(()=>{const frame=window.requestAnimationFrame(()=>{const params=new URLSearchParams(window.location.search);if(params.has('search')){setQuery(params.get('search')??'');searchRef.current?.focus()}});return()=>window.cancelAnimationFrame(frame)},[]);
  useEffect(()=>{activeTab.current?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'})},[category]);
  const shown=useMemo(()=>{const normalized=normalize(query);return foods.filter((food)=>(category==='همه'||food.category===category)&&(!normalized||normalize(`${food.title} ${food.shortDescription}`).includes(normalized))&&(filter!=='featured'||food.featured)&&(filter!=='available'||food.available))},[query,category,filter]);
  return <div className="menu-browser"><header className="menu-browser-heading"><span>انتخاب خوش‌طعم امروز</span><h2>چی میل دارید؟</h2><p>دسته‌بندی دلخواه را انتخاب کنید یا نام غذا را جستجو کنید.</p></header><div className="category-tabs" role="tablist" aria-label="دسته‌بندی غذاها">{categories.map((value)=><button type="button" ref={value===category?activeTab:undefined} role="tab" aria-selected={value===category} className={value===category?'active':''} onClick={()=>setCategory(value)} key={value}>{value}</button>)}</div><div className="menu-tools"><label className="search-box"><span className="sr-only">جستجوی غذا</span><Search/><input ref={searchRef} value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="مثلاً چلوکباب کوبیده..."/>{query&&<button type="button" onClick={()=>setQuery('')} aria-label="پاک کردن جستجو"><X/></button>}</label><div className="menu-filters" aria-label="فیلتر منو">{([['all','همه'],['featured','پیشنهادها'],['available','موجود']] as const).map(([value,label])=><button type="button" key={value} className={filter===value?'active':''} aria-pressed={filter===value} onClick={()=>setFilter(value)}>{label}</button>)}</div></div><div className="menu-results-heading"><div><span>{category==='همه'?'همه غذاها':category}</span><small>{shown.length.toLocaleString('fa-IR')} انتخاب</small></div></div>{shown.length?<div className="food-grid menu-grid">{shown.map((food)=><FoodCard key={food.id} food={food}/>)}</div>:<div className="no-results"><Search/><h3>غذایی پیدا نشد</h3><p>جستجو یا فیلترها را تغییر دهید.</p><button type="button" onClick={()=>{setQuery('');setCategory('همه');setFilter('all')}}>پاک کردن فیلترها</button></div>}</div>;
}
