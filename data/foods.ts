import type { Food } from '@/types/food';

const images = {
  kebab: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=88',
  chicken: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=1200&q=88',
  rice: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=88',
  stew: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=88',
  salad: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=88',
  yogurt: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?auto=format&fit=crop&w=1200&q=88',
  drink: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=1200&q=88',
};
const addons = [
  { id: 'extra-kebab', title: 'یک سیخ کوبیده اضافه', price: 145000 },
  { id: 'extra-rice', title: 'برنج اضافه', price: 78000 },
  { id: 'tomato', title: 'گوجه کبابی اضافه', price: 28000 },
  { id: 'butter', title: 'کره', price: 18000 },
  { id: 'yogurt', title: 'ماست موسیر', price: 46000 },
  { id: 'doogh', title: 'دوغ سنتی', price: 39000 },
];
const item = (id: string, title: string, price: number, category: string, image: string, featured = false, available = true): Food => ({
  id, slug: id, title, price, category, image, gallery: [image, images.rice], featured, available, addons,
  shortDescription: 'همراه برنج ایرانی، گوجه کبابی و کره',
  fullDescription: 'طعمی اصیل با گوشت تازه، ادویه مخصوص خانه کباب و برنج ایرانی خوش‌عطر.',
  tags: featured ? ['پرفروش'] : [], rating: 4.8, reviewsCount: 128,
});
export const foods: Food[] = [
  item('chelo-kabab-koobideh','چلوکباب کوبیده',318000,'کباب‌ها',images.kebab,true),
  item('koobideh-special','چلوکباب کوبیده مخصوص',389000,'کباب‌ها',images.kebab,true),
  item('juje-zaferani','جوجه کباب زعفرانی',298000,'جوجه',images.chicken,true),
  item('juje-with-bone','جوجه کباب با استخوان',348000,'جوجه',images.chicken,false),
  item('soltani','چلوکباب سلطانی',598000,'کباب‌ها',images.kebab,true),
  item('barg','چلوکباب برگ',538000,'کباب‌ها',images.kebab,true),
  item('chenjeh','چلوکباب چنجه',498000,'کباب‌ها',images.kebab,true),
  item('baghali-mahiche','باقالی پلو با ماهیچه',648000,'پلوها',images.rice),
  item('zereshk-morgh','زرشک پلو با مرغ',328000,'پلوها',images.rice,true),
  item('ghormeh-sabzi','قورمه سبزی',288000,'خورشت‌ها',images.stew),
  item('gheymeh','قیمه سیب‌زمینی',278000,'خورشت‌ها',images.stew),
  item('kashk-bademjan','کشک بادمجان',178000,'پیش‌غذا',images.stew),
  item('mirza-ghasemi','میرزا قاسمی',188000,'پیش‌غذا',images.stew,false,false),
  item('shirazi','سالاد شیرازی',79000,'سالاد',images.salad),
  item('mast-moosir','ماست موسیر',69000,'پیش‌غذا',images.yogurt),
  item('doogh','دوغ سنتی',59000,'نوشیدنی',images.drink),
];
export const categories = ['همه','کباب‌ها','جوجه','خورشت‌ها','پلوها','پیش‌غذا','سالاد','نوشیدنی'];
export const formatPrice = (price: number) => `${new Intl.NumberFormat('fa-IR').format(price)} تومان`;
