export type FoodCategory = 'کباب‌ها' | 'جوجه' | 'خورشت‌ها' | 'پلوها' | 'پیش‌غذا' | 'سالاد' | 'نوشیدنی';
export type FoodTag = 'پرفروش' | 'پیشنهاد سرآشپز';
export type DeliveryMethod = 'delivery' | 'pickup';
export type PaymentMethod = 'online' | 'on-delivery';

export type Addon = { id: string; title: string; price: number };
export type Food = {
  id: string; slug: string; title: string; shortDescription: string; fullDescription: string;
  price: number; compareAtPrice?: number; category: FoodCategory; image: string; gallery: string[];
  tags: FoodTag[]; available: boolean; featured: boolean; rating: number; reviewsCount: number; addons: Addon[];
};
