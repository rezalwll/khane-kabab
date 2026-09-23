import type { Metadata } from 'next';
import { MenuBrowser } from '@/components/menu/menu-browser';
export const metadata: Metadata={title:'منوی خانه کباب طهران'};
export default function MenuPage(){return <main className="inner-page"><section className="page-hero"><div className="container"><span>تازه از آشپزخانه</span><h1>منوی خانه کباب طهران</h1><p>از کباب‌های تازه تا خورشت‌های اصیل؛ امروز چی میل دارید؟</p></div></section><section className="container menu-section"><MenuBrowser/></section></main>}
