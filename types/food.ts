export type FoodCategory = string;
export type FoodTag = 'پیشنهاد خانه کباب' | 'پیشنهاد سرآشپز';

export type Addon = {
  id: string;
  title: string;
  price: number;
  groupId?: string;
};
export type FoodOptionGroup = {
  id: string;
  name: string;
  selectionType: 'single' | 'multiple';
  minSelect: number;
  maxSelect: number | null;
  isRequired: boolean;
  options: Addon[];
};
export type Food = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  compareAtPrice?: number;
  category: FoodCategory;
  image: string;
  gallery: string[];
  tags: FoodTag[];
  available: boolean;
  featured: boolean;
  addons: Addon[];
  optionGroups?: FoodOptionGroup[];
};
