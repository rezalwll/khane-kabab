# Khane Kabab API

سرویس مستقل Backend خانه کباب طهران برای استقرار روی Node.js 22+ و PostgreSQL. این سرویس از storefront ریشه جداست و می‌تواند روی VPS مستقل اجرا شود.

## Stack

- Hono و Node.js adapter
- PostgreSQL و Drizzle ORM / drizzle-kit
- Zod برای اعتبارسنجی ورودی و محیط
- Pino برای log ساختاریافته
- Vitest برای تست‌های متمرکز

تمام مبلغ‌ها عدد صحیح **تومان** هستند. زمان‌ها در PostgreSQL به‌صورت `timestamp with time zone` و با مبنای UTC ذخیره می‌شوند.

## اجرای محلی

مقادیر `docker-compose.yml` فقط برای توسعه محلی هستند و نباید در production استفاده شوند.

```bash
cd server
cp .env.example .env
npm install
docker compose up -d
npm run db:migrate
npm run db:seed
npm run dev
```

نمونه `DATABASE_URL` محلی:

```env
DATABASE_URL=postgresql://khane_kabab_dev:local-development-only@localhost:5432/khane_kabab
```

فرمان‌های بررسی:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

تغییر schema با migration مدیریت می‌شود:

```bash
npm run db:generate
npm run db:migrate
```

از `drizzle-kit push` به‌عنوان راهبرد migration محیط production استفاده نمی‌شود.

## Seed

`npm run db:seed` دسته‌ها، ۱۶ محصول، تصاویر محلی، موجودی، گروه‌های افزودنی، کوپن `KABAB10` و اطلاعات شناخته‌شده رستوران را به‌شکل idempotent ثبت یا به‌روزرسانی می‌کند. داده‌های `data/foods.ts` فقط منبع **seed اولیه** بوده‌اند؛ پس از اتصال frontend، دیتابیس source of truth خواهد بود. ساعت کاری و نشانی خیابان به دلیل نبود اطلاعات معتبر seed نمی‌شوند.

## Endpointها

- `GET /health`
- `GET /api/v1/menu`
- `GET /api/v1/products/:slug`
- `POST /api/v1/coupons/validate`
- `POST /api/v1/orders`
- `GET /api/v1/orders/:publicNumber` با header الزامی `X-Order-Token`

قیمت، موجودی، افزودنی، کوپن و هزینه ارسال در سرور از دیتابیس خوانده می‌شوند. هیچ مبلغ ارسالی از client پذیرفته نمی‌شود. ساخت سفارش، اقلام، snapshot افزودنی‌ها و افزایش مصرف کوپن داخل یک transaction انجام می‌شود.

## رهگیری سفارش

هنگام ثبت سفارش یک توکن تصادفی امن تولید می‌شود. مقدار خام فقط یک‌بار در پاسخ ثبت سفارش برمی‌گردد و در دیتابیس فقط SHA-256 آن ذخیره می‌شود. شماره عمومی سفارش به‌تنهایی برای مشاهده سفارش کافی نیست و پاسخ رهگیری اطلاعات شخصی کامل را برنمی‌گرداند. توکن خام، نشانی کامل و secrets در log ثبت نمی‌شوند.

## محدودیت امنیتی این فاز

احراز هویت مدیر در فاز ۲A وجود ندارد؛ بنابراین هیچ endpoint عمومی برای mutation مدیریتی یا تغییر وضعیت سفارش ساخته نشده است. صفحات `/admin` فقط اسکلت رابط هستند. پرداخت، OTP، پیامک، نقشه و سرویس پیک نیز عمداً به فازهای بعد موکول شده‌اند.
