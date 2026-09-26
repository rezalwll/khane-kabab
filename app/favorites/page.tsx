import type { Metadata } from 'next';
import { FavoritesContent } from '@/components/favorites/favorites-content';
export const metadata:Metadata={title:'علاقه‌مندی‌ها | خانه کباب طهران'};
export default function FavoritesPage(){return <main className="inner-page simple-page"><div className="container"><div className="simple-heading"><span>انتخاب‌های شما</span><h1>علاقه‌مندی‌ها</h1><p>غذاهایی که برای بعد نگه داشته‌اید.</p></div><FavoritesContent/></div></main>}
