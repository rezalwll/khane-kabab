'use client';
import { useMemo, useState } from 'react';
import { Check, Minus, Plus, ShoppingBag } from 'lucide-react';
import { formatPrice } from '@/lib/format-price';
import { useCart } from '@/stores/cart-store';
import { useToastStore } from '@/stores/toast-store';
import type { Addon, Food } from '@/types/food';

export function ProductOrder({food}:{food:Food}){
  const [quantity,setQuantity]=useState(1); const [selected,setSelected]=useState<Addon[]>([]); const [note,setNote]=useState('');
  const addItem=useCart((state)=>state.addItem); const showToast=useToastStore((state)=>state.show);
  const total=useMemo(()=>(food.price+selected.reduce((sum,addon)=>sum+addon.price,0))*quantity,[food.price,selected,quantity]);
  const toggle=(addon:Addon)=>setSelected((current)=>current.some((value)=>value.id===addon.id)?current.filter((value)=>value.id!==addon.id):[...current,addon]);
  const add=()=>{if(!food.available)return;addItem(food,quantity,selected,note);showToast(`${food.title} به سبد خرید اضافه شد`)};
  return <div className="product-info">{food.tags[0]&&<span className="product-badge">{food.tags[0]}</span>}<h1>{food.title}</h1><p>{food.fullDescription}</p><strong className="product-price">{formatPrice(food.price)}</strong><hr/><div className="product-row"><div><h2>تعداد</h2><small>حداقل یک پرس</small></div><div className="qty large" aria-label="انتخاب تعداد"><button type="button" onClick={()=>setQuantity((value)=>Math.max(1,value-1))} disabled={quantity===1} aria-label="کم کردن تعداد"><Minus/></button><output aria-live="polite">{quantity.toLocaleString('fa-IR')}</output><button type="button" onClick={()=>setQuantity((value)=>value+1)} aria-label="زیاد کردن تعداد"><Plus/></button></div></div>{food.addons.length>0&&<><hr/><fieldset className="addons"><legend>در کنار غذا</legend><p>انتخاب‌های دلخواه را اضافه کنید</p><div>{food.addons.map((addon)=>{const checked=selected.some((value)=>value.id===addon.id);return <label key={addon.id} className={checked?'checked':''}><input type="checkbox" checked={checked} onChange={()=>toggle(addon)}/><i aria-hidden="true">{checked&&<Check/>}</i><span>{addon.title}</span><strong>+ {formatPrice(addon.price)}</strong></label>})}</div></fieldset></>}<label className="chef-note"><span>توضیحات برای آشپزخانه <small>(اختیاری)</small></span><textarea value={note} onChange={(event)=>setNote(event.target.value)} maxLength={160} placeholder="مثلاً برنج کم‌روغن باشد..."/></label><button type="button" className="primary-button add-main" onClick={add} disabled={!food.available}><ShoppingBag/>{food.available?'افزودن به سبد':'فعلاً ناموجود'}<strong>{formatPrice(total)}</strong></button><div className="mobile-product-cta"><span><small>مبلغ این انتخاب</small><strong>{formatPrice(total)}</strong></span><button type="button" onClick={add} disabled={!food.available}><ShoppingBag/>{food.available?'افزودن':'ناموجود'}</button></div></div>;
}
