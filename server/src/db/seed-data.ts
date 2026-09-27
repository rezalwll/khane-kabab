export const categorySeeds = [
  ['kebabs', 'کباب‌ها'],
  ['chicken', 'جوجه'],
  ['stews', 'خورشت‌ها'],
  ['rice', 'پلوها'],
  ['starters', 'پیش‌غذا'],
  ['salads', 'سالاد'],
  ['drinks', 'نوشیدنی'],
] as const;

export const optionSeeds = {
  kebabs: [
    ['extra-kebab', 'یک سیخ کوبیده اضافه', 145000],
    ['extra-rice', 'برنج ایرانی اضافه', 78000],
    ['tomato', 'گوجه کبابی اضافه', 28000],
    ['yogurt', 'ماست موسیر', 46000],
    ['doogh', 'دوغ سنتی', 39000],
  ],
  chicken: [
    ['extra-rice', 'برنج ایرانی اضافه', 78000],
    ['tomato', 'گوجه کبابی اضافه', 28000],
    ['shirazi', 'سالاد شیرازی', 79000],
    ['doogh', 'دوغ سنتی', 39000],
  ],
  stews: [
    ['extra-rice', 'برنج ایرانی اضافه', 78000],
    ['shirazi', 'سالاد شیرازی', 79000],
    ['yogurt', 'ماست موسیر', 46000],
    ['doogh', 'دوغ سنتی', 39000],
  ],
  rice: [
    ['yogurt', 'ماست موسیر', 46000],
    ['shirazi', 'سالاد شیرازی', 79000],
    ['doogh', 'دوغ سنتی', 39000],
  ],
  starters: [['doogh', 'دوغ سنتی', 39000]],
  salads: [
    ['yogurt', 'ماست موسیر', 46000],
    ['doogh', 'دوغ سنتی', 39000],
  ],
  drinks: [],
} as const;

type ProductSeed = {
  slug: string;
  title: string;
  priceToman: number;
  category: string;
  image: string;
  shortDescription: string;
  description: string;
  isFeatured?: boolean;
  isAvailable?: boolean;
  gallery?: string[];
};
export const productSeeds: ProductSeed[] = [
  {
    slug: 'chelo-kabab-koobideh',
    title: 'چلوکباب کوبیده',
    priceToman: 318000,
    category: 'kebabs',
    image: '/images/foods/kebab.jpg',
    isFeatured: true,
    shortDescription: 'دو سیخ کوبیده تازه‌چرخ با برنج ایرانی و گوجه کبابی',
    description:
      'کوبیده تازه‌چرخ‌شده با پیاز و نمک، دو سیخ روی آتش و همراه برنج ایرانی زعفرانی، گوجه کبابی و کره.',
  },
  {
    slug: 'koobideh-special',
    title: 'چلوکباب کوبیده مخصوص',
    priceToman: 389000,
    category: 'kebabs',
    image: '/images/foods/kebab.jpg',
    isFeatured: true,
    shortDescription: 'کوبیده ویژه با وزن بیشتر و برنج زعفرانی',
    description:
      'دو سیخ کوبیده مخصوص با گوشت تازه، پخت آبدار روی زغال و دورچین کامل خانه کباب.',
  },
  {
    slug: 'juje-zaferani',
    title: 'جوجه کباب زعفرانی',
    priceToman: 298000,
    category: 'chicken',
    image: '/images/foods/chicken.jpg',
    isFeatured: true,
    gallery: ['/images/foods/chicken.jpg', '/images/foods/salad.jpg'],
    shortDescription: 'جوجه بدون استخوان مزه‌دارشده با زعفران ایرانی',
    description:
      'تکه‌های مرغ تازه با زعفران، لیمو و پیاز مزه‌دار شده و همراه برنج ایرانی و گوجه کبابی سرو می‌شود.',
  },
  {
    slug: 'juje-with-bone',
    title: 'جوجه کباب با استخوان',
    priceToman: 348000,
    category: 'chicken',
    image: '/images/foods/chicken.jpg',
    gallery: ['/images/foods/chicken.jpg', '/images/foods/salad.jpg'],
    shortDescription: 'جوجه کامل با استخوان، زعفرانی و آبدار',
    description:
      'جوجه کامل مزه‌دارشده با زعفران ایرانی، آرام روی آتش پخته می‌شود تا بافتی نرم و آبدار داشته باشد.',
  },
  {
    slug: 'soltani',
    title: 'چلوکباب سلطانی',
    priceToman: 598000,
    category: 'kebabs',
    image: '/images/foods/kebab.jpg',
    isFeatured: true,
    shortDescription: 'ترکیب یک سیخ برگ و یک سیخ کوبیده',
    description:
      'ترکیب مجلسی کباب برگ نرم و کوبیده تازه‌چرخ، همراه برنج زعفرانی، کره و گوجه کبابی.',
  },
  {
    slug: 'barg',
    title: 'چلوکباب برگ',
    priceToman: 538000,
    category: 'kebabs',
    image: '/images/foods/kebab.jpg',
    isFeatured: true,
    shortDescription: 'برگ لطیف گوسفندی با برنج ایرانی',
    description:
      'راسته ورقه‌شده و مزه‌دارشده، پخته روی آتش و سرو شده با برنج ایرانی زعفرانی و دورچین روز.',
  },
  {
    slug: 'chenjeh',
    title: 'چلوکباب چنجه',
    priceToman: 498000,
    category: 'kebabs',
    image: '/images/foods/kebab.jpg',
    isFeatured: true,
    shortDescription: 'تکه‌های گوشت مزه‌دارشده و آبدار',
    description:
      'تکه‌های یکدست گوشت تازه که با پیاز و ادویه ملایم مزه‌دار و روی شعله مستقیم کباب می‌شوند.',
  },
  {
    slug: 'baghali-mahiche',
    title: 'باقالی پلو با ماهیچه',
    priceToman: 648000,
    category: 'rice',
    image: '/images/foods/rice.jpg',
    gallery: ['/images/foods/rice.jpg', '/images/foods/stew.jpg'],
    shortDescription: 'ماهیچه آرام‌پز با باقالی‌پلو و شوید',
    description:
      'ماهیچه نرم و آرام‌پز در کنار باقالی‌پلو معطر، زعفران و ته‌دیگ روز سرو می‌شود.',
  },
  {
    slug: 'zereshk-morgh',
    title: 'زرشک پلو با مرغ',
    priceToman: 328000,
    category: 'rice',
    image: '/images/foods/rice.jpg',
    isFeatured: true,
    gallery: ['/images/foods/rice.jpg', '/images/foods/chicken.jpg'],
    shortDescription: 'مرغ مجلسی با زرشک، زعفران و برنج ایرانی',
    description:
      'مرغ مجلسی با سس زعفرانی، زرشک تفت‌داده‌شده و خلال بادام در کنار برنج ایرانی.',
  },
  {
    slug: 'ghormeh-sabzi',
    title: 'قورمه سبزی',
    priceToman: 288000,
    category: 'stews',
    image: '/images/foods/stew.jpg',
    gallery: ['/images/foods/stew.jpg', '/images/foods/rice.jpg'],
    shortDescription: 'خورشت جاافتاده با سبزی تازه و لیموعمانی',
    description:
      'قورمه‌سبزی جاافتاده با گوشت، لوبیا و لیموعمانی، همراه یک پرس برنج ایرانی.',
  },
  {
    slug: 'gheymeh',
    title: 'قیمه سیب‌زمینی',
    priceToman: 278000,
    category: 'stews',
    image: '/images/foods/stew.jpg',
    gallery: ['/images/foods/stew.jpg', '/images/foods/rice.jpg'],
    shortDescription: 'قیمه لپه و گوشت با سیب‌زمینی ترد',
    description:
      'خورشت قیمه با لپه، گوشت و لیموعمانی، همراه سیب‌زمینی سرخ‌شده و برنج ایرانی.',
  },
  {
    slug: 'kashk-bademjan',
    title: 'کشک بادمجان',
    priceToman: 178000,
    category: 'starters',
    image: '/images/foods/stew.jpg',
    gallery: ['/images/foods/stew.jpg', '/images/foods/yogurt.jpg'],
    shortDescription: 'بادمجان، کشک، نعنا داغ و پیازداغ',
    description:
      'بادمجان پخته و کوبیده‌شده با کشک، نعنا داغ، پیازداغ و گردوی خردشده.',
  },
  {
    slug: 'mirza-ghasemi',
    title: 'میرزا قاسمی',
    priceToman: 188000,
    category: 'starters',
    image: '/images/foods/stew.jpg',
    isAvailable: false,
    gallery: ['/images/foods/stew.jpg', '/images/foods/salad.jpg'],
    shortDescription: 'بادمجان دودی، گوجه تازه و تخم‌مرغ',
    description:
      'بادمجان دودی شمالی با گوجه تازه، سیر و تخم‌مرغ؛ در حال حاضر موقتاً ناموجود است.',
  },
  {
    slug: 'shirazi',
    title: 'سالاد شیرازی',
    priceToman: 79000,
    category: 'salads',
    image: '/images/foods/salad.jpg',
    gallery: ['/images/foods/salad.jpg', '/images/foods/yogurt.jpg'],
    shortDescription: 'خیار، گوجه و پیاز با آب‌لیموی تازه',
    description:
      'سالاد شیرازی تازه با خیار، گوجه، پیاز و چاشنی آب‌لیمو؛ آماده‌شده در همان روز.',
  },
  {
    slug: 'mast-moosir',
    title: 'ماست موسیر',
    priceToman: 69000,
    category: 'starters',
    image: '/images/foods/yogurt.jpg',
    gallery: ['/images/foods/yogurt.jpg', '/images/foods/salad.jpg'],
    shortDescription: 'ماست چکیده با موسیر و سبزی معطر',
    description:
      'ماست چکیده خنک با موسیر، نمک ملایم و سبزی معطر؛ همراه کلاسیک غذاهای ایرانی.',
  },
  {
    slug: 'doogh',
    title: 'دوغ سنتی',
    priceToman: 59000,
    category: 'drinks',
    image: '/images/foods/drink.jpg',
    gallery: ['/images/foods/drink.jpg', '/images/foods/yogurt.jpg'],
    shortDescription: 'دوغ خنک سنتی با نعنا',
    description:
      'دوغ سنتی خنک با طعم ملایم نعنا، مناسب در کنار کباب و غذای ایرانی.',
  },
];
