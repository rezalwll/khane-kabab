import type { Metadata } from 'next';
import { CartPageContent } from '@/components/cart/cart-page-content';
export const metadata: Metadata = { title: 'سبد خرید | خانه کباب طهران' };
export default function CartPage() {
  return (
    <main className="inner-page simple-page">
      <div className="container">
        <div className="simple-heading">
          <span>سفارش شما</span>
          <h1>سبد خرید</h1>
          <p>اقلام را بررسی کنید و سپس سفارش را نهایی کنید.</p>
        </div>
        <CartPageContent />
      </div>
    </main>
  );
}
