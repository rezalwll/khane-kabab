import type { Metadata } from 'next';import { CheckoutFlow } from '@/components/checkout/checkout-flow';
export const metadata:Metadata={title:'ثبت سفارش | خانه کباب طهران'};
export default function CheckoutPage(){return <main className="inner-page simple-page"><div className="container"><div className="simple-heading"><span>تکمیل سفارش</span><h1>ثبت سفارش</h1><p>چند قدم کوتاه تا یک وعده گرم و تازه</p></div><CheckoutFlow/></div></main>}
