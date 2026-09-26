'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { formatPrice } from '@/lib/format-price';
import { calculateItemTotal, getOrderSummary } from '@/lib/order-calculations';
import { useCart } from '@/stores/cart-store';
import { useOrderStore } from '@/stores/order-store';
import { useToastStore } from '@/stores/toast-store';

export function CartPageContent(){
  const {items,increment,decrement,removeItem}=useCart(); const {couponCode,discountPercent,applyCoupon,removeCoupon}=useOrderStore();
  const showToast=useToastStore((state)=>state.show); const [code,setCode]=useState(''); const [error,setError]=useState('');
  const summary=getOrderSummary(items,discountPercent,'delivery');
  const apply=()=>{if(applyCoupon(code)){setError('');setCode('');showToast('تخفیف ۱۰ درصدی اعمال شد')}else{setError('کد تخفیف معتبر نیست')}};
  const remove=()=>{removeCoupon();showToast('کد تخفیف حذف شد')};
  if(!items.length)return <div className="empty-cart page-empty"><ShoppingBag/><h2>سبد خرید شما خالی است</h2><p>از منوی امروز یک غذای خوش‌طعم انتخاب کنید.</p><Link href="/menu" className="primary-button">مشاهده منو</Link></div>;
  return <div className="cart-page-grid"><section className="cart-list"><h2>اقلام سفارش</h2>{items.map((item)=><article key={item.key}><div className="cart-item-image"><Image src={item.food.image} alt={item.food.title} fill sizes="110px"/></div><div><h3>{item.food.title}</h3><p>{item.addons.map((addon)=>addon.title).join('، ')||item.food.shortDescription}</p>{item.note&&<p>یادداشت: {item.note}</p>}<strong>{formatPrice(calculateItemTotal(item))}</strong></div><div className="qty"><button type="button" onClick={()=>decrement(item.key)} disabled={item.quantity===1} aria-label={`کم کردن ${item.food.title}`}><Minus/></button><span>{item.quantity.toLocaleString('fa-IR')}</span><button type="button" onClick={()=>increment(item.key)} aria-label={`زیاد کردن ${item.food.title}`}><Plus/></button></div><button type="button" className="remove" onClick={()=>removeItem(item.key)} aria-label={`حذف ${item.food.title}`}><Trash2/></button></article>)}</section><aside className="order-summary"><h2>خلاصه سفارش</h2>{couponCode?<div className="applied-coupon"><span><strong>{couponCode}</strong><small>۱۰٪ تخفیف روی جمع سفارش</small></span><button type="button" onClick={remove} aria-label="حذف کد تخفیف"><X/></button></div>:<><label htmlFor="discount"><span>کد آزمایشی: <strong>KABAB10</strong></span></label><div className="discount-field"><input id="discount" value={code} onChange={(event)=>setCode(event.target.value)} placeholder="کد تخفیف"/><button type="button" onClick={apply}>اعمال</button></div>{error&&<p className="field-error" role="alert">{error}</p>}</>}<dl><div><dt>جمع سفارش</dt><dd>{formatPrice(summary.subtotal)}</dd></div><div><dt>تخفیف</dt><dd>{summary.discount?`− ${formatPrice(summary.discount)}`:'۰ تومان'}</dd></div><div><dt>هزینه ارسال تقریبی</dt><dd>{formatPrice(summary.deliveryFee)}</dd></div></dl><div className="summary-total"><span>مبلغ نهایی</span><strong>{formatPrice(summary.total)}</strong></div><Link href="/checkout" className="primary-button">ادامه و ثبت سفارش</Link><small>هزینه نهایی با انتخاب نحوه دریافت به‌روز می‌شود.</small></aside></div>;
}
