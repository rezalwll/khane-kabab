export type FoodCategory = 'کباب‌ها' | 'جوجه' | 'خورشت‌ها' | 'پلوها' | 'پیش‌غذا' | 'سالاد' | 'نوشیدنی';
export type FoodTag = 'پیشنهاد خانه کباب' | 'پیشنهاد سرآشپز';

export type Addon = { id: string; title: string; price: number };
export type Food = {
  id: string; slug: string; title: string; shortDescription: string; fullDescription: string;
  price: number; compareAtPrice?: number; category: FoodCategory; image: string; gallery: string[];
  tags: FoodTag[]; available: boolean; featured: boolean; addons: Addon[];
};
