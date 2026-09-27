# خانه کباب طهران

رابط فارسی، RTL و Mobile-first فروش آنلاین خانه کباب طهران به‌همراه Backend سفارش و پنل مدیریت امن.

## پشته فنی

- React 19 و TypeScript strict
- Vinext روی Vite و Cloudflare Workers
- Zustand برای snapshot پایدار سبد، علاقه‌مندی‌ها و توکن محلی پیگیری سفارش
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
- `/cart` سبد snapshot و اعتبارسنجی کد تخفیف با API
- `/checkout` تسویه چهارمرحله‌ای، quote نهایی سرور و ثبت واقعی سفارش
- `/order/success` نتیجه سفارش واقعی
- `/orders` و `/orders/[publicNumber]` فهرست و پیگیری زنده سفارش‌های مهمان
- `/account` راهنمای سفارش مهمان (حساب مشتری هنوز وجود ندارد)
- `/admin/login` ورود امن مدیر
- `/admin` داشبورد زنده مدیریت
- `/admin/orders` سفارش‌ها و تغییر وضعیت
- `/admin/menu` مدیریت دسته، محصول، موجودی و افزودنی
- `/admin/settings` تنظیمات رستوران، ساعات کاری و تغییر رمز
- `/admin/notifications` مانیتور صف پیامک و retry

## محدودیت‌های این فاز

سرویس واقعی درگاه و پیامک هنوز متصل نیست؛ هر دو ادپتر، capability check، جدول‌ها و راه‌اندازی امن دارند و تا پیکربندی provider غیرفعال می‌مانند. حساب مشتری، OTP، نقشه و سرویس پیک در این فاز وجود ندارند.

## Backend foundation

سرویس مستقل Node.js/PostgreSQL در پوشه `server/` قرار دارد. سفارش عمومی و پنل مدیریت authenticated به API واقعی متصل‌اند. راه‌اندازی، migration، bootstrap مدیر، نقش‌ها و endpointها در [server/README.md](server/README.md) مستند شده‌اند.

برای اتصال‌های آینده frontend مقدار زیر را در `.env` ریشه تنظیم کنید:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

هیچ رمز مدیر پیش‌فرضی وجود ندارد؛ پس از migration و seed با متغیرهای `ADMIN_BOOTSTRAP_*` و فرمان `npm run admin:bootstrap` مالک اولیه را ایجاد کنید.
