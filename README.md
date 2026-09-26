# خانه کباب طهران

رابط فارسی، RTL و Mobile-first فروش آنلاین خانه کباب طهران. این نسخه یک Frontend نمایشی و آماده ارائه است؛ سفارش، پرداخت، حساب کاربری و رهگیری هنوز به Backend واقعی متصل نیستند.

## پشته فنی

- React 19 و TypeScript strict
- Vinext روی Vite و Cloudflare Workers
- Zustand برای سبد خرید، تخفیف، علاقه‌مندی‌ها و آخرین سفارش محلی
- CSS اختصاصی و فونت محلی ایران‌یکان

Vinext عمداً حفظ شده است، چون پروژه به ChatGPT Sites، پلاگین Vite و خروجی Cloudflare وابستگی مستقیم دارد. مهاجرت به Next.js رسمی در این مرحله deployment فعلی را به خطر می‌انداخت.

## اجرا و کنترل کیفیت

```bash
npm install
npm run dev
npx tsc --noEmit
npm run lint
npm run build
```

برای متادیتای مطلق، فایل `.env.local` بسازید:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

در محیط نهایی مقدار متغیر را با دامنه واقعی جایگزین کنید.

## مسیرها

- `/` صفحه اصلی
- `/menu` منو، جستجو و فیلتر
- `/menu/[slug]` جزئیات، گالری و افزودنی‌های محصول
- `/menu/full` منوی کامل قابل چاپ
- `/favorites` علاقه‌مندی‌های ذخیره‌شده
- `/cart` سبد و کد تخفیف نمایشی `KABAB10` با حفظ وضعیت تا Checkout
- `/checkout` تسویه چهارمرحله‌ای با validation
- `/order/success` نتیجه ثبت سفارش نمایشی
- `/orders` سفارش‌های نمایشی
- `/account` حساب کاربری نمایشی

## محدودیت‌های این فاز

Backend، دیتابیس، ورود/OTP، پیامک، درگاه پرداخت، نقشه، API سفارش و سیستم پیک متصل نشده‌اند. هیچ سفارش واقعی برای رستوران ارسال نمی‌شود. سبد خرید، کد تخفیف، علاقه‌مندی‌ها و `lastOrder` فقط در `localStorage` همین مرورگر نگه‌داری می‌شوند و با پاک‌کردن داده‌های مرورگر از بین می‌روند.

## Backend foundation

سرویس مستقل Node.js/PostgreSQL در پوشه `server/` قرار دارد و فعلاً به جریان نمایشی storefront متصل نشده است. راه‌اندازی، migration، seed و endpointها در [server/README.md](server/README.md) مستند شده‌اند.

برای اتصال‌های آینده frontend مقدار زیر را در `.env` ریشه تنظیم کنید:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

اسکلت نمایشی پنل داخلی در مسیرهای `/admin`، `/admin/orders`، `/admin/menu` و `/admin/settings` قرار دارد. احراز هویت و عملیات مدیریتی هنوز فعال نیستند.
