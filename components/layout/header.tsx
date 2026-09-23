'use client';
import Link from 'next/link';
import { Menu, Search, ShoppingBag, UserRound } from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { useCart } from '@/stores/cart-store';
export function Header(){
  const items=useCart(s=>s.items); const open=useCart(s=>s.setDrawerOpen);
  const count=items.reduce((s,i)=>s+i.quantity,0);
  return <header className="site-header"><div className="container header-inner"><Logo/><nav className="desktop-nav" aria-label="منوی اصلی"><Link href="/">خانه</Link><Link href="/menu">منو</Link><Link href="/#about">داستان ما</Link><Link href="#footer">تماس با ما</Link></nav><div className="header-actions"><Link className="round-action search-action" href="/menu" aria-label="جستجو"><Search size={20}/></Link><button className="round-action user-action" aria-label="حساب کاربری"><UserRound size={20}/></button><button className="cart-icon" aria-label="سبد خرید" onClick={()=>open(true)}><ShoppingBag size={20}/><b>{count.toLocaleString('fa-IR')}</b></button><Link className="primary-button compact" href="/menu">سفارش آنلاین</Link><button className="mobile-menu" aria-label="منو"><Menu size={22}/></button></div></div></header>;
}
