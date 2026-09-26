import type { Metadata } from 'next';
import { OrdersContent } from '@/components/order/orders-content';
export const metadata:Metadata={title:'سفارش‌های من | خانه کباب طهران'};
export default function OrdersPage(){return <main className="inner-page simple-page"><div className="container narrow-page"><div className="simple-heading"><span>سفارش محلی</span><h1>سفارش‌های من</h1><p>آخرین سفارش نمایشی ذخیره‌شده در همین مرورگر</p></div><OrdersContent/></div></main>}
