import { apiRequest } from './client';
export type ApiOption = {
  id: string;
  name: string;
  priceDeltaToman: number;
  sortOrder: number;
};
export type ApiOptionGroup = {
  id: string;
  name: string;
  selectionType: 'single' | 'multiple';
  minSelect: number;
  maxSelect: number | null;
  isRequired: boolean;
  options: ApiOption[];
};
export type ApiProduct = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  priceToman: number;
  compareAtPriceToman: number | null;
  isAvailable: boolean;
  isFeatured: boolean;
  images: { url: string; altText: string; isPrimary: boolean }[];
  optionGroups: ApiOptionGroup[];
};
export const getMenu = () =>
  apiRequest<{
    categories: {
      id: string;
      slug: string;
      name: string;
      description: string | null;
      products: ApiProduct[];
    }[];
  }>('/api/v1/menu');
export const getProduct = (slug: string) =>
  apiRequest<ApiProduct>(`/api/v1/products/${encodeURIComponent(slug)}`);
