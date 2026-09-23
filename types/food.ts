export type Addon = { id: string; title: string; price: number };
export type Food = {
  id: string; slug: string; title: string; shortDescription: string; fullDescription: string;
  price: number; compareAtPrice?: number; category: string; image: string; gallery: string[];
  tags: string[]; available: boolean; featured: boolean; rating: number; reviewsCount: number; addons: Addon[];
};
