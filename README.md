# خانه کباب طهران

فاز اول رابط کاربری و تجربه سفارش آنلاین رستوران، کاملاً فارسی، RTL و Mobile-first.

## اجرا

```bash
npm install
npm run dev
```

برای کنترل کیفیت:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## مسیرها

- `/` صفحه اصلی
- `/menu` منو، جستجو و فیلتر
- `/menu/chelo-kabab-koobideh` جزئیات محصول
- `/cart` سبد خرید
- `/checkout` تسویه چهارمرحله‌ای
- `/order/success` موفقیت و رهگیری سفارش

## فنی

داده‌های فعلی mock هستند. سبد خرید با Zustand و `localStorage` ماندگار است. در فاز بعد Backend، احراز هویت، API، درگاه پرداخت و سیستم پیک متصل می‌شوند.
