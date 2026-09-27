import { and, asc, eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import type { AppDb } from '../../db/client.js';
import {
  categories,
  optionGroups,
  options,
  productImages,
  productOptionGroups,
  products,
} from '../../db/schema.js';

export function menuRoutes(db: AppDb) {
  return new Hono().get('/', async (c) => {
    const categoryRows = await db
      .select({
        id: categories.id,
        slug: categories.slug,
        name: categories.name,
        description: categories.description,
        sortOrder: categories.sortOrder,
      })
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.sortOrder));
    const categoryIds = categoryRows.map((row) => row.id);
    const productRows = categoryIds.length
      ? await db
          .select({
            id: products.id,
            categoryId: products.categoryId,
            slug: products.slug,
            title: products.title,
            shortDescription: products.shortDescription,
            description: products.description,
            priceToman: products.priceToman,
            compareAtPriceToman: products.compareAtPriceToman,
            isAvailable: products.isAvailable,
            isFeatured: products.isFeatured,
            sortOrder: products.sortOrder,
          })
          .from(products)
          .where(
            and(
              eq(products.isActive, true),
              inArray(products.categoryId, categoryIds),
            ),
          )
          .orderBy(asc(products.sortOrder))
      : [];
    const productIds = productRows.map((row) => row.id);
    const images = productIds.length
      ? await db
          .select({
            productId: productImages.productId,
            url: productImages.url,
            altText: productImages.altText,
            sortOrder: productImages.sortOrder,
            isPrimary: productImages.isPrimary,
          })
          .from(productImages)
          .where(inArray(productImages.productId, productIds))
          .orderBy(asc(productImages.sortOrder))
      : [];
    const links = productIds.length
      ? await db
          .select({
            productId: productOptionGroups.productId,
            groupId: optionGroups.id,
            name: optionGroups.name,
            selectionType: optionGroups.selectionType,
            minSelect: optionGroups.minSelect,
            maxSelect: optionGroups.maxSelect,
            isRequired: optionGroups.isRequired,
            sortOrder: productOptionGroups.sortOrder,
          })
          .from(productOptionGroups)
          .innerJoin(
            optionGroups,
            and(
              eq(productOptionGroups.optionGroupId, optionGroups.id),
              eq(optionGroups.isActive, true),
            ),
          )
          .where(inArray(productOptionGroups.productId, productIds))
          .orderBy(asc(productOptionGroups.sortOrder))
      : [];
    const groupIds = [...new Set(links.map((link) => link.groupId))];
    const optionRows = groupIds.length
      ? await db
          .select({
            id: options.id,
            optionGroupId: options.optionGroupId,
            name: options.name,
            priceDeltaToman: options.priceDeltaToman,
            sortOrder: options.sortOrder,
          })
          .from(options)
          .where(
            and(
              eq(options.isActive, true),
              inArray(options.optionGroupId, groupIds),
            ),
          )
          .orderBy(asc(options.sortOrder))
      : [];
    const serialized = categoryRows.map((category) => ({
      ...category,
      products: productRows
        .filter((product) => product.categoryId === category.id)
        .map((product) => ({
          ...product,
          images: images
            .filter((image) => image.productId === product.id)
            .map(({ productId: _, ...image }) => image),
          optionGroups: links
            .filter((link) => link.productId === product.id)
            .map((group) => ({
              id: group.groupId,
              name: group.name,
              selectionType: group.selectionType,
              minSelect: group.minSelect,
              maxSelect: group.maxSelect,
              isRequired: group.isRequired,
              sortOrder: group.sortOrder,
              options: optionRows
                .filter((option) => option.optionGroupId === group.groupId)
                .map(({ optionGroupId: _, ...option }) => option),
            })),
        })),
    }));
    return c.json({ categories: serialized });
  });
}
