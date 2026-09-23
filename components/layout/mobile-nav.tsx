'use client';
import Link from 'next/link';
import { Heart, Home, ListOrdered, MenuSquare, UserRound } from 'lucide-react';
export function MobileNav(){return <nav className="mobile-nav" aria-label="ناوبری موبایل"><Link href="/"><Home/><span>خانه</span></Link><Link href="/menu"><MenuSquare/><span>منو</span></Link><Link href="/order/success"><ListOrdered/><span>سفارش‌ها</span></Link><button><Heart/><span>علاقه‌مندی</span></button><button><UserRound/><span>حساب من</span></button></nav>}
