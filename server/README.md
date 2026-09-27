# Khane Kabab API

سرویس مستقل Node.js 22+، Hono، PostgreSQL و Drizzle برای storefront و پنل مدیریت خانه کباب طهران است. مبلغ‌ها عدد صحیح تومان و زمان‌های دیتابیس `timestamp with time zone` هستند.

## اجرای محلی

```bash
cp .env.example .env
npm install
docker compose up -d
npm run db:migrate
npm run db:seed:initial
npm run admin:bootstrap
npm run dev
```

`ADMIN_BOOTSTRAP_USERNAME`، `ADMIN_BOOTSTRAP_PASSWORD` (حداقل ۱۲ نویسه) و `ADMIN_BOOTSTRAP_DISPLAY_NAME` باید پیش از bootstrap تنظیم شوند. رمز پیش‌فرضی وجود ندارد؛ فرمان فقط یک owner جدید می‌سازد، رمز را چاپ نمی‌کند و کاربر موجود را overwrite نمی‌کند.

## احراز هویت مدیر

- رمزها با scrypt داخلی Node، salt تصادفی ۱۶ بایتی و پارامترهای `N=32768,r=8,p=1` هش می‌شوند.
- پس از ورود یک توکن opaque تصادفی ۳۲ بایتی در کوکی `kk_admin_session` قرار می‌گیرد؛ دیتابیس فقط SHA-256 آن را نگه می‌دارد.
- کوکی HttpOnly، SameSite=Lax و محدود به `/api/v1/admin` است. در production مقدار `ADMIN_COOKIE_SECURE=true` و origin دقیق HTTPS را تنظیم کنید. `ADMIN_COOKIE_DOMAIN` اختیاری است.
- عمر پیش‌فرض نشست ۱۲ ساعت است. نشست منقضی یا revokeشده پذیرفته نمی‌شود. پنج خطای ورود، حساب را ۱۵ دقیقه قفل می‌کند.
- همه mutationهای ادمین به Origin عضو `ADMIN_ORIGINS` نیاز دارند؛ CORS ادمین credentials را فقط برای همین originها فعال می‌کند.
- تغییر رمز، رمز فعلی را بررسی و تمام نشست‌ها را revoke می‌کند و یک نشست تازه می‌سازد.

پاک‌سازی نشست‌های منقضی و نشست‌های revokeشده قدیمی:

```bash
npm run admin:sessions:cleanup
```

برای production این فرمان باید بعداً با scheduler اجرا شود؛ cron داخل برنامه اضافه نشده است.

## نقش‌ها

| قابلیت                        | owner | manager | staff |
| ----------------------------- | ----: | ------: | ----: |
| داشبورد و مشاهده سفارش        |     ✓ |       ✓ |     ✓ |
| تغییر وضعیت سفارش             |     ✓ |       ✓ |     ✓ |
| مشاهده منو                    |     ✓ |       ✓ |     ✓ |
| نوشتن منو/ساختار کاتالوگ      |     ✓ |       ✓ |     — |
| مشاهده و ویرایش تنظیمات/ساعات |     ✓ |       ✓ |     — |

## Endpointها

عمومی: `GET /health`، `GET /ready`، `GET /api/v1/menu`، `GET /api/v1/products/:slug`، `POST /api/v1/coupons/validate`، `POST /api/v1/orders/quote`، `POST /api/v1/orders`، `GET /api/v1/orders/:publicNumber` با `X-Order-Token`، `POST /api/v1/payments/:publicNumber/start` و `GET /api/v1/restaurant`.

مدیریت:

- auth: `POST /api/v1/admin/auth/login`، `GET .../me`، `POST .../logout`، `POST .../change-password`
- dashboard: `GET /api/v1/admin/dashboard`
- orders: `GET /api/v1/admin/orders`، `GET /:id` و `PATCH /:id/status` با `expectedStatus`
- menu: `GET /api/v1/admin/menu` و create/update دسته، محصول، موجودی، تصاویر metadata، گروه‌های افزودنی و optionها
- settings: `GET/PATCH /api/v1/admin/settings` و `GET/PUT /api/v1/admin/opening-hours`
- integrations: `GET/PATCH /api/v1/admin/integrations`
- notifications: `GET /api/v1/admin/notifications` و `POST /:id/retry`
- system: `GET /api/v1/admin/system` بدون نمایش secret

همه پاسخ‌های authenticated ادمین `Cache-Control: no-store` دارند. عملیات ورود/خروج، رمز، سفارش، منو، تنظیمات و ساعات در `admin_audit_logs` ثبت می‌شوند؛ رمز، توکن خام و PII کامل در audit/log قرار نمی‌گیرند.

ثبت سفارش عمومی در سرور `ordersEnabled`، روش فعال delivery/pickup و `minimumOrderToman` را روی subtotal پیش از تخفیف و بدون هزینه ارسال اعمال می‌کند. قیمت و موجودی فقط از دیتابیس خوانده می‌شوند. `clientOrderId` یکتا است؛ retry همان سفارش را با توکن پیگیری تازه بازمی‌گرداند.

## اتصال درگاه و پیامک

adapter هر دو provider به‌طور پیش‌فرض `disabled` است. تنها تغییر toggle دیتابیس آن‌ها را فعال نمی‌کند؛ provider و secretها باید در environment سرور پیکربندی شوند. پیام‌ها در outbox ذخیره و با worker مستقل ارسال می‌شوند:

```bash
npm run notifications:work
```

rate limit عملیات quote، ثبت سفارش، شروع پرداخت و ورود ادمین process-local است. در اجرای چندنمونه‌ای distributed نیست و باید با rate limiter توزیع‌شده جایگزین شود.

راهنمای production، backup/restore و checklistها در `deploy/README.md` است.

## Migration و QA

```bash
npm run db:generate
npm run db:migrate
npm run typecheck
npm run lint
npm run test
npm run build
```

Migrationها فقط forward هستند و `drizzle-kit push` راهبرد production نیست. جداول امنیتی `admin_users`، `admin_sessions` و `admin_audit_logs` در migration فاز ۲B اضافه شده‌اند.

محدودیت‌های فعلی: provider واقعی پرداخت و SMS، OTP، حساب مشتری، نقشه، WebSocket و بازیابی رمز با ایمیل/پیامک هنوز پیاده‌سازی نشده‌اند.
