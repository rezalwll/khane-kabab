# راهنمای استقرار تولید خانه کباب

این راهنما برای اجرای COD روی یک میزبان Linux/Container و PostgreSQL 16 یا 17 است. درگاه و پیامک تا اتصال provider واقعی غیرفعال می‌مانند.

## پیش‌نیازها

- Docker با Compose یا Node.js 22
- PostgreSQL 16/17 و ابزارهای `psql`، `pg_dump` و `pg_restore`
- دامنه و HTTPS معتبر؛ TLS می‌تواند در reverse proxy یا لایه میزبانی terminate شود.
- محل محافظت‌شده و جدا از سرور برای کپی backupها

PostgreSQL خودمیزبان نباید پورت 5432 را عمومی کند. سرویس نمونه Compose آن را publish نمی‌کند. برای دیتابیس مدیریت‌شده، شبکه خصوصی ترجیح دارد.

## متغیرهای تولید

`server/.env.production.example` را به فایلی خارج از Git کپی و مقداردهی کنید. `DATABASE_SSL_MODE=require` بررسی گواهی را غیرفعال نمی‌کند. `CORS_ORIGINS` و `ADMIN_ORIGINS` باید origin دقیق HTTPS باشند و `ADMIN_COOKIE_SECURE=true` الزامی است.

رازهای آینده پرداخت و پیامک فقط در environment سرور یا secret manager میزبانی قرار می‌گیرند؛ هرگز در frontend، دیتابیس، فرم ادمین یا Git ذخیره نمی‌شوند.

frontend فقط به این دو مقدار عمومی نیاز دارد:

```env
NEXT_PUBLIC_SITE_URL=https://example.com
NEXT_PUBLIC_API_URL=https://api.example.com
```

## ترتیب انتشار

1. backup معتبر بگیرید.
2. migrationهای forward-only را اجرا کنید.
3. image نسخه جدید را deploy کنید.
4. پاسخ `GET /ready` را بررسی کنید.
5. `npm run smoke:production` را با حساب smoke اختصاصی اجرا کنید.

Migration در startup خودکار اجرا نمی‌شود.

## راه‌اندازی دیتابیس جدید

در `server/`:

```bash
npm ci
npm run db:migrate
npm run db:seed:initial
npm run admin:bootstrap
```

seed برای بار اول است و در صورت وجود catalog از overwrite خودداری می‌کند. `ALLOW_SEED_OVERWRITE=true` فقط برای اقدام آگاهانه و دستی است. پس از seed، دیتابیس منبع حقیقت منو و تنظیمات است.

Bootstrap کاربر موجود را overwrite نمی‌کند. بعد از ساخت موفق owner، `ADMIN_BOOTSTRAP_PASSWORD` را از environment پایدار حذف کنید.

## ساخت و اجرا

```bash
docker compose -f deploy/docker-compose.production.yml build api
docker compose -f deploy/docker-compose.production.yml up -d api
docker compose -f deploy/docker-compose.production.yml --profile worker up -d notification-worker
```

برای PostgreSQL خودمیزبان نمونه `deploy/docker-compose.postgres.example.yml` را با secret واقعی اجرا کنید؛ پورت 5432 عمومی نشده است. `DATABASE_URL` باید hostname سرویس `postgres` را هدف بگیرد. image API برای worker نیز استفاده می‌شود. در حالت `SMS_PROVIDER=disabled` worker بدون ثبت ارسال ساختگی، ایمن idle می‌ماند.

## سلامت و smoke

- `/health`: زنده‌بودن process، بدون وابستگی به DB
- `/ready`: اتصال واقعی DB و نسخه برنامه؛ در خرابی DB پاسخ 503

```bash
API_BASE_URL=https://api.example.com \
ADMIN_SMOKE_USERNAME=smoke-owner \
ADMIN_SMOKE_PASSWORD='from-secret-manager' \
npm --prefix server run smoke:production
```

اسکریپت رمز، cookie یا tracking token را چاپ نمی‌کند. اجرای smoke سفارش واقعی COD می‌سازد؛ آن را در عملیات مشخص و بعداً لغو/پاک‌سازی کنید.

## Backup، نگهداری و Restore

```bash
DATABASE_URL='...' BACKUP_DIR=/secure/backups ./deploy/backup-postgres.sh
BACKUP_DIR=/secure/backups BACKUP_RETENTION_DAYS=14 ./deploy/cleanup-backups.sh
DATABASE_URL='...' ./deploy/restore-postgres.sh /secure/backups/khane-kabab-....dump
```

Restore مخرب است، به تایید `RESTORE` نیاز دارد و خودکار اجرا نمی‌شود. automation می‌تواند فقط به‌صورت صریح `FORCE_RESTORE=true` تنظیم کند. backup تا زمانی که روی دیتابیس جدا restore و داده کلیدی بررسی نشده، verified نیست.

نمونه cron روزانه بدون مسیر hardcodeشده:

```cron
15 2 * * * cd "$KHANE_KABAB_RELEASE" && DATABASE_URL="$KHANE_KABAB_DATABASE_URL" BACKUP_DIR="$KHANE_KABAB_BACKUP_DIR" ./deploy/backup-postgres.sh
45 2 * * * cd "$KHANE_KABAB_RELEASE" && BACKUP_DIR="$KHANE_KABAB_BACKUP_DIR" BACKUP_RETENTION_DAYS=14 ./deploy/cleanup-backups.sh
```

## کارهای زمان‌بندی‌شده

پاک‌سازی نشست‌ها روزانه و پاک‌سازی پیام‌های sent/skipped هفتگی کافی است:

```cron
10 3 * * * cd "$KHANE_KABAB_RELEASE/server" && npm run admin:sessions:cleanup
20 3 * * 0 cd "$KHANE_KABAB_RELEASE/server" && NOTIFICATION_RETENTION_DAYS=90 npm run notifications:cleanup
```

پیام pending/failed حذف نمی‌شود و سفارش‌ها خودکار حذف نمی‌شوند.

## لاگ و retention

Pino در تولید JSON می‌نویسد: requestId، method، path، status و duration. رمز، cookie، tracking token، DATABASE_URL، نشانی کامل، موبایل کامل و secretها نباید log شوند.

- سفارش‌ها: نگهداری شوند.
- audit: پیشنهاد 180 تا 365 روز مطابق سیاست کسب‌وکار.
- نشست‌های منقضی/revoked: cleanup روزانه.
- outbox sent/skipped: cleanup پیشنهادی 90 روز.

Opening hours فعلاً اطلاعاتی است؛ کنترل صریح پذیرش سفارش `ordersEnabled` است.

## Reverse proxy و HTTPS

`deploy/Caddyfile.example` یک نمونه اختیاری است. backend روی loopback publish می‌شود. Admin با HTTP ساده production-ready نیست؛ cookie امن به HTTPS وابسته است.

## Rollback

برای rollback برنامه، image/tag نسخه قبلی را deploy کنید. migration را کورکورانه reverse نکنید؛ اصلاح forward ترجیح دارد. Restore دیتابیس فقط در اضطرار، با downtime اعلام‌شده، backup تاییدشده و تایید اپراتور انجام می‌شود.

## Launch

پس از build و `/ready`، checklistهای این پوشه را تکمیل و smoke واقعی delivery/pickup و مسیر admin→storefront را اجرا کنید. بدون E2E دیتابیس واقعی و restore test، راه‌اندازی COD هنوز تایید نهایی نشده است.
