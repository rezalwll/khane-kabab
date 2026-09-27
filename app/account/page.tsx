import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ChevronLeft,
  LogIn,
  MapPin,
  PackageCheck,
  UserRound,
} from 'lucide-react';
export const metadata: Metadata = { title: 'حساب من | خانه کباب طهران' };
export default function AccountPage() {
  return (
    <main className="inner-page simple-page">
      <div className="container narrow-page">
        <div className="simple-heading">
          <span>سفارش مهمان</span>
          <h1>حساب من</h1>
          <p>بدون ساخت حساب، سفارش‌های همین مرورگر را پیگیری کنید.</p>
        </div>
        <section className="account-card">
          <div className="account-person">
            <i>
              <UserRound />
            </i>
            <div>
              <strong>مهمان خانه کباب</strong>
              <small>سفارش مهمان</small>
            </div>
            <span>فعال</span>
          </div>
          <nav aria-label="گزینه‌های حساب">
            <Link href="/orders">
              <PackageCheck />
              <span>
                <strong>سفارش‌های من</strong>
                <small>پیگیری سفارش‌های اخیر</small>
              </span>
              <ChevronLeft />
            </Link>
            <div>
              <MapPin />
              <span>
                <strong>آدرس‌ها</strong>
                <small>پس از فعال‌شدن ورود قابل مدیریت است</small>
              </span>
            </div>
            <div>
              <LogIn />
              <span>
                <strong>ورود به حساب</strong>
                <small>احراز هویت هنوز فعال نیست</small>
              </span>
            </div>
          </nav>
        </section>
      </div>
    </main>
  );
}
