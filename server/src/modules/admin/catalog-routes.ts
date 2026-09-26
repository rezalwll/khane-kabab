import { asc, eq, inArray } from 'drizzle-orm';
import { Hono, type Context } from 'hono';
import { z } from 'zod';
import type { AppDb } from '../../db/client.js';
import {
  adminAuditLogs,
  categories,
  optionGroups,
  options,
  productImages,
  productOptionGroups,
  products,
} from '../../db/schema.js';
import { ApiError, notFound } from '../../lib/errors.js';
import type { AppVariables } from '../../middleware/request-id.js';
import { requirePermission } from './middleware.js';
import type { AdminVariables } from './types.js';

const id = z.uuid();
const sort = z.number().int().min(-10000).max(10000);
const price = z.number().int().min(0).max(1_000_000_000);
const categoryCreate = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).nullable().optional(),
  sortOrder: sort.default(0),
  isActive: z.boolean().default(true),
});
const categoryPatch = categoryCreate.partial();
const imageSchema = z.object({
  url: z.string().trim().min(1).max(1000),
  altText: z.string().trim().min(1).max(200),
  sortOrder: sort.default(0),
  isPrimary: z.boolean().default(false),
});
const productCreate = z.object({
  categoryId: id,
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/),
  title: z.string().trim().min(1).max(160),
  shortDescription: z.string().trim().max(500).default(''),
  description: z.string().trim().max(5000).default(''),
  priceToman: price,
  compareAtPriceToman: price.nullable().optional(),
  isActive: z.boolean().default(true),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: sort.default(0),
  images: z.array(imageSchema).max(12).optional(),
});
const productPatch = productCreate.partial();
const groupCreate = z
  .object({
    name: z.string().trim().min(1).max(160),
    selectionType: z.enum(['single', 'multiple']),
    isRequired: z.boolean().default(false),
    minSelect: z.number().int().min(0).max(50).default(0),
    maxSelect: z.number().int().min(0).max(50).nullable().optional(),
    sortOrder: sort.default(0),
    isActive: z.boolean().default(true),
  })
  .refine((v) => v.maxSelect == null || v.maxSelect >= v.minSelect, {
    message: 'حداکثر انتخاب نباید کمتر از حداقل باشد.',
  })
  .refine(
    (v) =>
      v.selectionType !== 'single' ||
      (v.minSelect <= 1 && (v.maxSelect == null || v.maxSelect <= 1)),
    { message: 'گروه تک‌انتخابی حداکثر یک انتخاب دارد.' },
  );
const groupPatch = z.object({
  name: z.string().trim().min(1).max(160).optional(),
  selectionType: z.enum(['single', 'multiple']).optional(),
  isRequired: z.boolean().optional(),
  minSelect: z.number().int().min(0).max(50).optional(),
  maxSelect: z.number().int().min(0).max(50).nullable().optional(),
  sortOrder: sort.optional(),
  isActive: z.boolean().optional(),
});
const optionCreate = z.object({
  name: z.string().trim().min(1).max(160),
  priceDeltaToman: price.default(0),
  sortOrder: sort.default(0),
  isActive: z.boolean().default(true),
});
const optionPatch = optionCreate.partial();
type AdminContext = Context<{ Variables: AppVariables & AdminVariables }>;
async function body<T extends z.ZodType>(
  c: AdminContext,
  schema: T,
): Promise<z.infer<T>> {
  const parsed = schema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success)
    throw new ApiError(
      422,
      'VALIDATION_ERROR',
      parsed.error.issues[0]?.message ?? 'داده معتبر نیست.',
    );
  return parsed.data;
}

export function adminCatalogRoutes(db: AppDb) {
  const app = new Hono<{ Variables: AppVariables & AdminVariables }>();
  app.use('*', requirePermission('menu:read'));
  app.get('/menu', async (c) => {
    const [
      categoryRows,
      productRows,
      imageRows,
      groupRows,
      optionRows,
      assignments,
    ] = await Promise.all([
      db.select().from(categories).orderBy(asc(categories.sortOrder)),
      db.select().from(products).orderBy(asc(products.sortOrder)),
      db.select().from(productImages).orderBy(asc(productImages.sortOrder)),
      db.select().from(optionGroups).orderBy(asc(optionGroups.sortOrder)),
      db.select().from(options).orderBy(asc(options.sortOrder)),
      db
        .select()
        .from(productOptionGroups)
        .orderBy(asc(productOptionGroups.sortOrder)),
    ]);
    return c.json({
      categories: categoryRows,
      products: productRows.map((p) => ({
        ...p,
        images: imageRows.filter((i) => i.productId === p.id),
        optionGroupIds: assignments
          .filter((a) => a.productId === p.id)
          .map((a) => ({ id: a.optionGroupId, sortOrder: a.sortOrder })),
      })),
      optionGroups: groupRows.map((g) => ({
        ...g,
        options: optionRows.filter((o) => o.optionGroupId === g.id),
      })),
    });
  });
  app.get('/option-groups', async (c) => {
    const [groups, optionRows] = await Promise.all([
      db.select().from(optionGroups).orderBy(asc(optionGroups.sortOrder)),
      db.select().from(options).orderBy(asc(options.sortOrder)),
    ]);
    return c.json({
      optionGroups: groups.map((group) => ({
        ...group,
        options: optionRows.filter(
          (option) => option.optionGroupId === group.id,
        ),
      })),
    });
  });
  app.post('/categories', requirePermission('menu:write'), async (c) => {
    const input = await body(c, categoryCreate);
    const [row] = await db.insert(categories).values(input).returning();
    await audit(db, c, 'CATEGORY_CREATED', 'category', row!.id);
    return c.json({ category: row }, 201);
  });
  app.patch('/categories/:id', requirePermission('menu:write'), async (c) => {
    const input = await body(c, categoryPatch);
    const [row] = await db
      .update(categories)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(categories.id, c.req.param('id')))
      .returning();
    if (!row)
      throw new ApiError(404, 'CATEGORY_NOT_FOUND', 'دسته‌بندی پیدا نشد.');
    await audit(db, c, 'CATEGORY_UPDATED', 'category', row.id);
    return c.json({ category: row });
  });
  app.post('/products', requirePermission('menu:write'), async (c) => {
    const input = await body(c, productCreate);
    const { images, ...values } = input;
    const row = await db.transaction(async (tx) => {
      const [created] = await tx.insert(products).values(values).returning();
      if (!created) throw new Error('Product insert failed');
      if (images?.length)
        await tx
          .insert(productImages)
          .values(images.map((image) => ({ ...image, productId: created.id })));
      return created;
    });
    await audit(db, c, 'PRODUCT_CREATED', 'product', row.id);
    return c.json({ product: row }, 201);
  });
  app.patch('/products/:id', requirePermission('menu:write'), async (c) => {
    const input = await body(c, productPatch);
    const { images, ...values } = input;
    const row = await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(products)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(products.id, c.req.param('id')))
        .returning();
      if (!updated)
        throw new ApiError(404, 'PRODUCT_NOT_FOUND', 'محصول پیدا نشد.');
      if (images) {
        await tx
          .delete(productImages)
          .where(eq(productImages.productId, updated.id));
        if (images.length)
          await tx
            .insert(productImages)
            .values(
              images.map((image) => ({ ...image, productId: updated.id })),
            );
      }
      return updated;
    });
    await audit(db, c, 'PRODUCT_UPDATED', 'product', row.id);
    return c.json({ product: row });
  });
  app.patch(
    '/products/:id/availability',
    requirePermission('menu:write'),
    async (c) => {
      const input = await body(c, z.object({ isAvailable: z.boolean() }));
      const [row] = await db
        .update(products)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(products.id, c.req.param('id')))
        .returning();
      if (!row) throw new ApiError(404, 'PRODUCT_NOT_FOUND', 'محصول پیدا نشد.');
      await audit(db, c, 'PRODUCT_AVAILABILITY_CHANGED', 'product', row.id, {
        isAvailable: row.isAvailable,
      });
      return c.json({ product: row });
    },
  );
  app.put(
    '/products/:id/option-groups',
    requirePermission('menu:write'),
    async (c) => {
      const { optionGroupIds } = await body(
        c,
        z.object({
          optionGroupIds: z.array(z.object({ id, sortOrder: sort })).max(50),
        }),
      );
      const unique = [...new Set(optionGroupIds.map((x) => x.id))];
      if (unique.length !== optionGroupIds.length)
        throw new ApiError(422, 'VALIDATION_ERROR', 'گروه تکراری است.');
      const found = unique.length
        ? await db
            .select({ id: optionGroups.id })
            .from(optionGroups)
            .where(inArray(optionGroups.id, unique))
        : [];
      if (found.length !== unique.length)
        throw new ApiError(
          422,
          'VALIDATION_ERROR',
          'یکی از گروه‌ها معتبر نیست.',
        );
      const productId = c.req.param('id');
      await db.transaction(async (tx) => {
        const [product] = await tx
          .select({ id: products.id })
          .from(products)
          .where(eq(products.id, productId))
          .limit(1);
        if (!product)
          throw new ApiError(404, 'PRODUCT_NOT_FOUND', 'محصول پیدا نشد.');
        await tx
          .delete(productOptionGroups)
          .where(eq(productOptionGroups.productId, productId));
        if (optionGroupIds.length)
          await tx.insert(productOptionGroups).values(
            optionGroupIds.map((x) => ({
              productId,
              optionGroupId: x.id,
              sortOrder: x.sortOrder,
            })),
          );
      });
      await audit(
        db,
        c,
        'PRODUCT_OPTION_GROUPS_REPLACED',
        'product',
        productId,
        { count: optionGroupIds.length },
      );
      return c.json({ ok: true });
    },
  );
  app.post('/option-groups', requirePermission('menu:write'), async (c) => {
    const input = await body(c, groupCreate);
    const [row] = await db.insert(optionGroups).values(input).returning();
    await audit(db, c, 'OPTION_GROUP_CREATED', 'option_group', row!.id);
    return c.json({ optionGroup: row }, 201);
  });
  app.patch(
    '/option-groups/:id',
    requirePermission('menu:write'),
    async (c) => {
      const input = await body(c, groupPatch);
      const [existing] = await db
        .select()
        .from(optionGroups)
        .where(eq(optionGroups.id, c.req.param('id')))
        .limit(1);
      if (!existing) throw notFound('گروه افزودنی پیدا نشد.');
      const validated = groupCreate.safeParse({ ...existing, ...input });
      if (!validated.success)
        throw new ApiError(
          422,
          'VALIDATION_ERROR',
          validated.error.issues[0]?.message ?? 'گروه معتبر نیست.',
        );
      const [row] = await db
        .update(optionGroups)
        .set({ ...validated.data, updatedAt: new Date() })
        .where(eq(optionGroups.id, c.req.param('id')))
        .returning();
      if (!row)
        throw new ApiError(409, 'CONFLICT', 'گروه هم‌زمان تغییر کرده است.');
      await audit(db, c, 'OPTION_GROUP_UPDATED', 'option_group', row.id);
      return c.json({ optionGroup: row });
    },
  );
  app.post(
    '/option-groups/:id/options',
    requirePermission('menu:write'),
    async (c) => {
      const input = await body(c, optionCreate);
      const [row] = await db
        .insert(options)
        .values({ ...input, optionGroupId: c.req.param('id') })
        .returning();
      await audit(db, c, 'OPTION_CREATED', 'option', row!.id);
      return c.json({ option: row }, 201);
    },
  );
  app.patch('/options/:id', requirePermission('menu:write'), async (c) => {
    const input = await body(c, optionPatch);
    const [row] = await db
      .update(options)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(options.id, c.req.param('id')))
      .returning();
    if (!row) throw notFound('افزودنی پیدا نشد.');
    await audit(db, c, 'OPTION_UPDATED', 'option', row.id);
    return c.json({ option: row });
  });
  return app;
}

async function audit(
  db: AppDb,
  c: AdminContext,
  action: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, unknown> = {},
) {
  await db.insert(adminAuditLogs).values({
    adminUserId: c.get('admin').id,
    action,
    entityType,
    entityId,
    requestId: c.get('requestId'),
    metadata,
  });
}
