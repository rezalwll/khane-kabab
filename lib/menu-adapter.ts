import type { ApiProduct } from '@/lib/api/menu';
import type { Food } from '@/types/food';

const fallbackImage = '/images/foods/kebab.jpg';

export function safeImageUrl(value?: string) {
  if (!value) return fallbackImage;
  if (value.startsWith('/')) return value;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? value
      : fallbackImage;
  } catch {
    return fallbackImage;
  }
}

export function apiProductToFood(product: ApiProduct, category = 'منو'): Food {
  const images = [...product.images].sort(
    (a, b) => Number(b.isPrimary) - Number(a.isPrimary),
  );
  const optionGroups = product.optionGroups.map((group) => ({
    ...group,
    options: group.options.map((option) => ({
      id: option.id,
      groupId: group.id,
      title: option.name,
      price: option.priceDeltaToman,
    })),
  }));
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    shortDescription: product.shortDescription,
    fullDescription: product.description,
    price: product.priceToman,
    compareAtPrice: product.compareAtPriceToman ?? undefined,
    category,
    image: safeImageUrl(images[0]?.url),
    gallery: images.length
      ? images.map((image) => safeImageUrl(image.url))
      : [fallbackImage],
    tags: product.isFeatured ? ['پیشنهاد خانه کباب'] : [],
    available: product.isAvailable,
    featured: product.isFeatured,
    addons: optionGroups.flatMap((group) => group.options),
    optionGroups,
  };
}
