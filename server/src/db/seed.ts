import { eq } from 'drizzle-orm';
import { loadEnv } from '../config/env.js';
import { createDatabase } from './client.js';
import {
  categories,
  coupons,
  notificationSettings,
  optionGroups,
  options,
  paymentSettings,
  productImages,
  productOptionGroups,
  products,
  restaurantSettings,
} from './schema.js';
import { categorySeeds, optionSeeds, productSeeds } from './seed-data.js';

const env = loadEnv();
const { db, pool } = createDatabase(env);

await db.transaction(async (tx) => {
  const categoryIds = new Map<string, string>();
  for (const [index, [slug, name]] of categorySeeds.entries()) {
    const [row] = await tx
      .insert(categories)
      .values({ slug, name, sortOrder: index })
      .onConflictDoUpdate({
        target: categories.slug,
        set: { name, sortOrder: index, isActive: true, updatedAt: new Date() },
      })
      .returning({ id: categories.id });
    if (!row) throw new Error(`Unable to seed category ${slug}`);
    categoryIds.set(slug, row.id);
  }

  const groupIds = new Map<string, string>();
  for (const [index, [slug, name]] of categorySeeds.entries()) {
    const [group] = await tx
      .insert(optionGroups)
      .values({
        name: `افزودنی‌های ${name}`,
        selectionType: 'multiple',
        minSelect: 0,
        maxSelect: null,
        isRequired: false,
        sortOrder: index,
      })
      .onConflictDoUpdate({
        target: optionGroups.name,
        set: { isActive: true, sortOrder: index, updatedAt: new Date() },
      })
      .returning({ id: optionGroups.id });
    if (!group) throw new Error(`Unable to seed option group ${slug}`);
    groupIds.set(slug, group.id);
    const seeds = optionSeeds[slug];
    for (const [optionIndex, option] of seeds.entries()) {
      const [, optionName, priceDeltaToman] = option;
      await tx
        .insert(options)
        .values({
          optionGroupId: group.id,
          name: optionName,
          priceDeltaToman,
          sortOrder: optionIndex,
        })
        .onConflictDoUpdate({
          target: [options.optionGroupId, options.name],
          set: {
            priceDeltaToman,
            sortOrder: optionIndex,
            isActive: true,
            updatedAt: new Date(),
          },
        });
    }
  }

  for (const [index, seed] of productSeeds.entries()) {
    const categoryId = categoryIds.get(seed.category);
    if (!categoryId) throw new Error(`Missing category ${seed.category}`);
    const [product] = await tx
      .insert(products)
      .values({
        categoryId,
        slug: seed.slug,
        title: seed.title,
        shortDescription: seed.shortDescription,
        description: seed.description,
        priceToman: seed.priceToman,
        isAvailable: seed.isAvailable ?? true,
        isFeatured: seed.isFeatured ?? false,
        sortOrder: index,
      })
      .onConflictDoUpdate({
        target: products.slug,
        set: {
          categoryId,
          title: seed.title,
          shortDescription: seed.shortDescription,
          description: seed.description,
          priceToman: seed.priceToman,
          isActive: true,
          isAvailable: seed.isAvailable ?? true,
          isFeatured: seed.isFeatured ?? false,
          sortOrder: index,
          updatedAt: new Date(),
        },
      })
      .returning({ id: products.id });
    if (!product) throw new Error(`Unable to seed product ${seed.slug}`);
    const images = [
      ...new Set(
        seed.gallery ?? [
          seed.image,
          seed.category === 'kebabs' ? '/images/foods/rice.jpg' : seed.image,
        ],
      ),
    ];
    for (const [imageIndex, url] of images.entries())
      await tx
        .insert(productImages)
        .values({
          productId: product.id,
          url,
          altText: seed.title,
          sortOrder: imageIndex,
          isPrimary: imageIndex === 0,
        })
        .onConflictDoUpdate({
          target: [productImages.productId, productImages.url],
          set: {
            altText: seed.title,
            sortOrder: imageIndex,
            isPrimary: imageIndex === 0,
          },
        });
    const optionGroupId = groupIds.get(seed.category);
    if (optionGroupId)
      await tx
        .insert(productOptionGroups)
        .values({ productId: product.id, optionGroupId, sortOrder: 0 })
        .onConflictDoUpdate({
          target: [
            productOptionGroups.productId,
            productOptionGroups.optionGroupId,
          ],
          set: { sortOrder: 0 },
        });
  }

  await tx
    .insert(coupons)
    .values({ code: 'KABAB10', type: 'percentage', value: 10, isActive: true })
    .onConflictDoUpdate({
      target: coupons.code,
      set: {
        type: 'percentage',
        value: 10,
        isActive: true,
        updatedAt: new Date(),
      },
    });
  const settingsId = '00000000-0000-4000-8000-000000000001';
  const existing = await tx
    .select({ id: restaurantSettings.id })
    .from(restaurantSettings)
    .where(eq(restaurantSettings.id, settingsId))
    .limit(1);
  const values = {
    restaurantName: 'خانه کباب طهران',
    phone: '22313311',
    instagram: '@Khane-kabab-tehran',
    city: 'تهران',
    deliveryEnabled: true,
    pickupEnabled: true,
    defaultDeliveryFeeToman: 49000,
    ordersEnabled: true,
  };
  if (existing.length)
    await tx
      .update(restaurantSettings)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(restaurantSettings.id, settingsId));
  else
    await tx.insert(restaurantSettings).values({ id: settingsId, ...values });
  await tx
    .insert(paymentSettings)
    .values({
      id: '00000000-0000-4000-8000-000000000002',
      onlinePaymentEnabled: false,
      provider: null,
    })
    .onConflictDoNothing();
  await tx
    .insert(notificationSettings)
    .values({
      id: '00000000-0000-4000-8000-000000000003',
      smsEnabled: false,
      provider: null,
    })
    .onConflictDoNothing();
});

console.log(
  JSON.stringify({
    level: 'info',
    message: 'Seed completed',
    products: productSeeds.length,
    categories: categorySeeds.length,
  }),
);
await pool.end();
