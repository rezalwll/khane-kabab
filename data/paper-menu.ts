export type PaperMenuItem = {
  title: string;
  note?: string;
  archivedPrice?: number;
};

export type PaperMenuSection = {
  id: string;
  title: string;
  description: string;
  items: PaperMenuItem[];
};

// قیمت‌ها فقط برای حفظ سند منوی چاپی سال ۱۳۹۸ ثبت شده‌اند و در رابط فروش نمایش داده نمی‌شوند.
export const paperMenuSections: PaperMenuSection[] = [
  {
    id: 'kebabs',
    title: 'انواع کباب',
    description: 'کباب‌های تازه‌چرخ و سیخی؛ قابل سفارش به‌صورت خوراک یا همراه چلو',
    items: [
      { title: 'برگ ممتاز', note: 'راسته گوساله', archivedPrice: 70000 },
      { title: 'برگ مخصوص', note: 'راسته گوسفندی', archivedPrice: 68000 },
      { title: 'کباب چنجه', archivedPrice: 55000 },
      { title: 'جوجه بدون استخوان', note: '۳۰۰ گرم', archivedPrice: 17500 },
      { title: 'جوجه با استخوان', note: 'یک جوجه کامل', archivedPrice: 25500 },
      { title: 'کباب کوبیده لقمه', note: '۱۶۰ گرم', archivedPrice: 16000 },
      { title: 'کباب کوبیده', note: '۱۱۰ گرم', archivedPrice: 10000 },
      { title: 'بال کباب', archivedPrice: 10000 },
      { title: 'کتف کباب', archivedPrice: 10000 },
      { title: 'چلو', note: 'برنج ایرانی', archivedPrice: 8500 },
      { title: 'ساندویچ کباب لقمه', archivedPrice: 18000 },
    ],
  },
  {
    id: 'chelo-kebab',
    title: 'چلوکباب',
    description: 'همراه برنج ایرانی، گوجه کبابی و مخلفات',
    items: [
      { title: 'چلوکباب سلطانی', archivedPrice: 80000 },
      { title: 'چلو برگ', note: 'راسته گوسفندی', archivedPrice: 80000 },
      { title: 'چلو برگ مخصوص', note: 'راسته گوسفندی', archivedPrice: 78000 },
      { title: 'چلو چنجه', archivedPrice: 65000 },
      { title: 'چلو جوجه با استخوان کامل', archivedPrice: 35000 },
      { title: 'چلو جوجه بدون استخوان', note: '۳۰۰ گرم', archivedPrice: 25000 },
      { title: 'چلو کباب دو سیخ', archivedPrice: 29000 },
      { title: 'چلو لقمه', archivedPrice: 25000 },
      { title: 'زرشک‌پلو با مرغ مجلسی', archivedPrice: 19000 },
    ],
  },
  {
    id: 'plates',
    title: 'خوراک',
    description: 'بدون برنج و همراه گوجه کبابی و مخلفات',
    items: [
      { title: 'خوراک برگ ممتاز', archivedPrice: 70000 },
      { title: 'خوراک برگ مخصوص', archivedPrice: 68000 },
      { title: 'خوراک چنجه', archivedPrice: 55000 },
      { title: 'خوراک جوجه با استخوان', archivedPrice: 17500 },
      { title: 'خوراک جوجه بدون استخوان', archivedPrice: 25500 },
      { title: 'خوراک کوبیده دو سیخ', archivedPrice: 16000 },
      { title: 'خوراک لقمه', archivedPrice: 10000 },
      { title: 'خوراک بال', archivedPrice: 10000 },
      { title: 'خوراک کتف', archivedPrice: 10000 },
    ],
  },
  {
    id: 'sides',
    title: 'مخلفات و غذاهای آماده',
    description: 'همراه‌های تازه برای کامل‌کردن سفارش',
    items: [
      { title: 'سالاد فصل' },
      { title: 'ماست موسیر مخصوص' },
      { title: 'زیتون پرورده' },
      { title: 'گوجه کبابی' },
      { title: 'بادمجان داغ تنوری' },
    ],
  },
  {
    id: 'drinks',
    title: 'نوشیدنی‌ها',
    description: 'نوشیدنی‌های سرد همراه غذا',
    items: [
      { title: 'دوغ محلی' },
      { title: 'دلستر' },
      { title: 'نوشابه' },
    ],
  },
];

export const paperMenuArchive = [
  { title: 'داخل منوی چاپی', href: '/brand/paper-menu-2019-inside.jpg' },
  { title: 'جلد منوی چاپی', href: '/brand/paper-menu-2019-cover.jpg' },
] as const;
