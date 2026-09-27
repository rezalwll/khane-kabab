import type { Addon, Food, FoodCategory, FoodTag } from '@/types/food';

const images = {
  kebab: '/images/foods/kebab.jpg',
  chicken: '/images/foods/chicken.jpg',
  rice: '/images/foods/rice.jpg',
  stew: '/images/foods/stew.jpg',
  salad: '/images/foods/salad.jpg',
  yogurt: '/images/foods/yogurt.jpg',
  drink: '/images/foods/drink.jpg',
} as const;

const shared: Record<string, Addon> = {
  rice: { id: 'extra-rice', title: 'برنج ایرانی اضافه', price: 78000 },
  tomato: { id: 'tomato', title: 'گوجه کبابی اضافه', price: 28000 },
  butter: { id: 'butter', title: 'کره حیوانی', price: 18000 },
  yogurt: { id: 'yogurt', title: 'ماست موسیر', price: 46000 },
  doogh: { id: 'doogh', title: 'دوغ سنتی', price: 39000 },
  kebab: { id: 'extra-kebab', title: 'یک سیخ کوبیده اضافه', price: 145000 },
  salad: { id: 'shirazi', title: 'سالاد شیرازی', price: 79000 },
};
const addonsByCategory: Record<FoodCategory, Addon[]> = {
  کباب‌ها: [
    shared.kebab,
    shared.rice,
    shared.tomato,
    shared.yogurt,
    shared.doogh,
  ],
  جوجه: [shared.rice, shared.tomato, shared.salad, shared.doogh],
  خورشت‌ها: [shared.rice, shared.salad, shared.yogurt, shared.doogh],
  پلوها: [shared.yogurt, shared.salad, shared.doogh],
  پیش‌غذا: [shared.doogh],
  سالاد: [shared.yogurt, shared.doogh],
  نوشیدنی: [],
};
type FoodSeed = {
  id: string;
  title: string;
  price: number;
  category: FoodCategory;
  image: keyof typeof images;
  shortDescription: string;
  fullDescription: string;
  featured?: boolean;
  available?: boolean;
  tags?: FoodTag[];
  gallery?: (keyof typeof images)[];
};
const item = (seed: FoodSeed): Food => ({
  ...seed,
  slug: seed.id,
  image: images[seed.image],
  gallery: (seed.gallery ?? [seed.image, 'rice']).map((key) => images[key]),
  featured: seed.featured ?? false,
  available: seed.available ?? true,
  tags: seed.tags ?? (seed.featured ? ['پیشنهاد خانه کباب'] : []),
  addons: addonsByCategory[seed.category],
});

export const foods: Food[] = [
  item({
    id: 'chelo-kabab-koobideh',
    title: 'چلوکباب کوبیده',
    price: 318000,
    category: 'کباب‌ها',
    image: 'kebab',
    featured: true,
    shortDescription: 'دو سیخ کوبیده تازه‌چرخ با برنج ایرانی و گوجه کبابی',
    fullDescription:
      'کوبیده تازه‌چرخ‌شده با پیاز و نمک، دو سیخ روی آتش و همراه برنج ایرانی زعفرانی، گوجه کبابی و کره.',
  }),
  item({
    id: 'koobideh-special',
    title: 'چلوکباب کوبیده مخصوص',
    price: 389000,
    category: 'کباب‌ها',
    image: 'kebab',
    featured: true,
    tags: ['پیشنهاد سرآشپز'],
    shortDescription: 'کوبیده ویژه با وزن بیشتر و برنج زعفرانی',
    fullDescription:
      'دو سیخ کوبیده مخصوص با گوشت تازه، پخت آبدار روی زغال و دورچین کامل خانه کباب.',
  }),
  item({
    id: 'juje-zaferani',
    title: 'جوجه کباب زعفرانی',
    price: 298000,
    category: 'جوجه',
    image: 'chicken',
    featured: true,
    gallery: ['chicken', 'salad'],
    shortDescription: 'جوجه بدون استخوان مزه‌دارشده با زعفران ایرانی',
    fullDescription:
      'تکه‌های مرغ تازه با زعفران، لیمو و پیاز مزه‌دار شده و همراه برنج ایرانی و گوجه کبابی سرو می‌شود.',
  }),
  item({
    id: 'juje-with-bone',
    title: 'جوجه کباب با استخوان',
    price: 348000,
    category: 'جوجه',
    image: 'chicken',
    gallery: ['chicken', 'salad'],
    shortDescription: 'جوجه کامل با استخوان، زعفرانی و آبدار',
    fullDescription:
      'جوجه کامل مزه‌دارشده با زعفران ایرانی، آرام روی آتش پخته می‌شود تا بافتی نرم و آبدار داشته باشد.',
  }),
  item({
    id: 'soltani',
    title: 'چلوکباب سلطانی',
    price: 598000,
    category: 'کباب‌ها',
    image: 'kebab',
    featured: true,
    tags: ['پیشنهاد سرآشپز'],
    shortDescription: 'ترکیب یک سیخ برگ و یک سیخ کوبیده',
    fullDescription:
      'ترکیب مجلسی کباب برگ نرم و کوبیده تازه‌چرخ، همراه برنج زعفرانی، کره و گوجه کبابی.',
  }),
  item({
    id: 'barg',
    title: 'چلوکباب برگ',
    price: 538000,
    category: 'کباب‌ها',
    image: 'kebab',
    featured: true,
    shortDescription: 'برگ لطیف گوسفندی با برنج ایرانی',
    fullDescription:
      'راسته ورقه‌شده و مزه‌دارشده، پخته روی آتش و سرو شده با برنج ایرانی زعفرانی و دورچین روز.',
  }),
  item({
    id: 'chenjeh',
    title: 'چلوکباب چنجه',
    price: 498000,
    category: 'کباب‌ها',
    image: 'kebab',
    featured: true,
    shortDescription: 'تکه‌های گوشت مزه‌دارشده و آبدار',
    fullDescription:
      'تکه‌های یکدست گوشت تازه که با پیاز و ادویه ملایم مزه‌دار و روی شعله مستقیم کباب می‌شوند.',
  }),
  item({
    id: 'baghali-mahiche',
    title: 'باقالی پلو با ماهیچه',
    price: 648000,
    category: 'پلوها',
    image: 'rice',
    gallery: ['rice', 'stew'],
    shortDescription: 'ماهیچه آرام‌پز با باقالی‌پلو و شوید',
    fullDescription:
      'ماهیچه نرم و آرام‌پز در کنار باقالی‌پلو معطر، زعفران و ته‌دیگ روز سرو می‌شود.',
  }),
  item({
    id: 'zereshk-morgh',
    title: 'زرشک پلو با مرغ',
    price: 328000,
    category: 'پلوها',
    image: 'rice',
    featured: true,
    gallery: ['rice', 'chicken'],
    shortDescription: 'مرغ مجلسی با زرشک، زعفران و برنج ایرانی',
    fullDescription:
      'مرغ مجلسی با سس زعفرانی، زرشک تفت‌داده‌شده و خلال بادام در کنار برنج ایرانی.',
  }),
  item({
    id: 'ghormeh-sabzi',
    title: 'قورمه سبزی',
    price: 288000,
    category: 'خورشت‌ها',
    image: 'stew',
    gallery: ['stew', 'rice'],
    shortDescription: 'خورشت جاافتاده با سبزی تازه و لیموعمانی',
    fullDescription:
      'قورمه‌سبزی جاافتاده با گوشت، لوبیا و لیموعمانی، همراه یک پرس برنج ایرانی.',
  }),
  item({
    id: 'gheymeh',
    title: 'قیمه سیب‌زمینی',
    price: 278000,
    category: 'خورشت‌ها',
    image: 'stew',
    gallery: ['stew', 'rice'],
    shortDescription: 'قیمه لپه و گوشت با سیب‌زمینی ترد',
    fullDescription:
      'خورشت قیمه با لپه، گوشت و لیموعمانی، همراه سیب‌زمینی سرخ‌شده و برنج ایرانی.',
  }),
  item({
    id: 'kashk-bademjan',
    title: 'کشک بادمجان',
    price: 178000,
    category: 'پیش‌غذا',
    image: 'stew',
    gallery: ['stew', 'yogurt'],
    shortDescription: 'بادمجان، کشک، نعنا داغ و پیازداغ',
    fullDescription:
      'بادمجان پخته و کوبیده‌شده با کشک، نعنا داغ، پیازداغ و گردوی خردشده.',
  }),
  item({
    id: 'mirza-ghasemi',
    title: 'میرزا قاسمی',
    price: 188000,
    category: 'پیش‌غذا',
    image: 'stew',
    available: false,
    gallery: ['stew', 'salad'],
    shortDescription: 'بادمجان دودی، گوجه تازه و تخم‌مرغ',
    fullDescription:
      'بادمجان دودی شمالی با گوجه تازه، سیر و تخم‌مرغ؛ در حال حاضر موقتاً ناموجود است.',
  }),
  item({
    id: 'shirazi',
    title: 'سالاد شیرازی',
    price: 79000,
    category: 'سالاد',
    image: 'salad',
    gallery: ['salad', 'yogurt'],
    shortDescription: 'خیار، گوجه و پیاز با آب‌لیموی تازه',
    fullDescription:
      'سالاد شیرازی تازه با خیار، گوجه، پیاز و چاشنی آب‌لیمو؛ آماده‌شده در همان روز.',
  }),
  item({
    id: 'mast-moosir',
    title: 'ماست موسیر',
    price: 69000,
    category: 'پیش‌غذا',
    image: 'yogurt',
    gallery: ['yogurt', 'salad'],
    shortDescription: 'ماست چکیده با موسیر و سبزی معطر',
    fullDescription:
      'ماست چکیده خنک با موسیر، نمک ملایم و سبزی معطر؛ همراه کلاسیک غذاهای ایرانی.',
  }),
  item({
    id: 'doogh',
    title: 'دوغ سنتی',
    price: 59000,
    category: 'نوشیدنی',
    image: 'drink',
    gallery: ['drink', 'yogurt'],
    shortDescription: 'دوغ خنک سنتی با نعنا',
    fullDescription:
      'دوغ سنتی خنک با طعم ملایم نعنا، مناسب در کنار کباب و غذای ایرانی.',
  }),
];
export const categories = [
  'همه',
  'کباب‌ها',
  'جوجه',
  'خورشت‌ها',
  'پلوها',
  'پیش‌غذا',
  'سالاد',
  'نوشیدنی',
] as const;
