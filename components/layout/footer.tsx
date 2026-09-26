import Link from 'next/link';
import { Camera as Instagram, MapPin, Phone } from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { restaurant } from '@/data/restaurant';
export function Footer(){return <footer id="footer" className="footer"><div className="container footer-grid"><div><Logo/><p>{restaurant.story}</p></div><div><h3>دسترسی سریع</h3><Link href="/menu">سفارش آنلاین</Link><Link href="/menu/full">منوی کامل و چاپی</Link><Link href="/favorites">علاقه‌مندی‌ها</Link><Link href="/orders">سفارش‌های من</Link></div><div><h3>ارتباط با ما</h3><a href={restaurant.phoneHref}><Phone size={16}/><span>{restaurant.phoneLabel}</span></a><span><MapPin size={16}/>{restaurant.locationLabel}</span><a href={restaurant.instagramHref} target="_blank" rel="noreferrer noopener"><Instagram size={16}/><span dir="ltr">{restaurant.instagramLabel}</span></a></div></div><div className="container copyright">© ۱۴۰۵ خانه کباب طهران</div></footer>}
