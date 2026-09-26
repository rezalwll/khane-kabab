import type { Metadata } from 'next';
import { SuccessContent } from '@/components/order/success-content';
export const metadata:Metadata={title:'سفارش ثبت شد | خانه کباب طهران'};
export default function SuccessPage(){return <main className="inner-page success-page"><div className="container"><SuccessContent/></div></main>}
