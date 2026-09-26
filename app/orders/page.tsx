import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock3, PackageCheck } from 'lucide-react';
import { formatPrice } from '@/lib/format-price';
export const metadata:Metadata={title:'سفارش‌های من | خانه کباب طهران'};
export default function OrdersPage(){return <main className="inner-page simple-page"><div className="container narrow-page"><div className="simple-heading"><span>پیگیری سفارش</span><h1>سفارش‌های من</h1><p>نمونه نمایشی وضعیت سفارش‌های اخیر</p></div><article className="mock-order"><header><div><small>شماره سفارش</small><strong dir="ltr">#22311</strong></div><span><Clock3/> در حال آماده‌سازی</span></header><div><PackageCheck/><p><strong>۲ قلم غذا</strong><small>چلوکباب کوبیده و دوغ سنتی</small></p><b>{formatPrice(685000)}</b></div><footer><small>این سفارش نمونه و صرفاً نمایشی است.</small><Link href="/menu">سفارش دوباره</Link></footer></article></div></main>}
