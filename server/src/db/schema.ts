import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  time,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
};

export const selectionTypeEnum = pgEnum('selection_type', [
  'single',
  'multiple',
]);
export const couponTypeEnum = pgEnum('coupon_type', ['percentage', 'fixed']);
export const orderStatusEnum = pgEnum('order_status', [
  'submitted',
  'confirmed',
  'preparing',
  'ready',
  'dispatched',
  'delivered',
  'cancelled',
]);
export const fulfillmentTypeEnum = pgEnum('fulfillment_type', [
  'delivery',
  'pickup',
]);
export const paymentMethodEnum = pgEnum('payment_method', [
  'online',
  'on_delivery',
]);
export const paymentStatusEnum = pgEnum('payment_status', [
  'unpaid',
  'pending',
  'paid',
  'failed',
  'refunded',
]);
export const adminRoleEnum = pgEnum('admin_role', [
  'owner',
  'manager',
  'staff',
]);
export const paymentAttemptStatusEnum = pgEnum('payment_attempt_status', [
  'created',
  'redirect_ready',
  'pending',
  'paid',
  'failed',
  'cancelled',
]);
export const notificationChannelEnum = pgEnum('notification_channel', ['sms']);
export const notificationStatusEnum = pgEnum('notification_status', [
  'pending',
  'processing',
  'sent',
  'failed',
  'skipped',
]);

export const adminUsers = pgTable(
  'admin_users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    username: text('username').notNull(),
    displayName: text('display_name').notNull(),
    passwordHash: text('password_hash').notNull(),
    role: adminRoleEnum('role').default('staff').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    failedLoginCount: integer('failed_login_count').default(0).notNull(),
    lockedUntil: timestamp('locked_until', { withTimezone: true }),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    ...timestamps,
  },
  (table) => [uniqueIndex('admin_users_username_uidx').on(table.username)],
);

export const adminSessions = pgTable(
  'admin_sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    adminUserId: uuid('admin_user_id')
      .notNull()
      .references(() => adminUsers.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    userAgent: text('user_agent'),
  },
  (table) => [
    uniqueIndex('admin_sessions_token_hash_uidx').on(table.tokenHash),
    index('admin_sessions_user_id_idx').on(table.adminUserId),
    index('admin_sessions_expires_at_idx').on(table.expiresAt),
  ],
);

export const adminAuditLogs = pgTable(
  'admin_audit_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    adminUserId: uuid('admin_user_id').references(() => adminUsers.id, {
      onDelete: 'set null',
    }),
    action: text('action').notNull(),
    entityType: text('entity_type'),
    entityId: text('entity_id'),
    requestId: text('request_id').notNull(),
    metadata: jsonb('metadata')
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('admin_audit_user_id_idx').on(table.adminUserId),
    index('admin_audit_created_at_idx').on(table.createdAt),
  ],
);

export const categories = pgTable(
  'categories',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    sortOrder: integer('sort_order').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('categories_slug_uidx').on(table.slug),
    index('categories_sort_order_idx').on(table.sortOrder),
  ],
);

export const products = pgTable(
  'products',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'restrict' }),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    shortDescription: text('short_description').notNull(),
    description: text('description').notNull(),
    priceToman: integer('price_toman').notNull(),
    compareAtPriceToman: integer('compare_at_price_toman'),
    isActive: boolean('is_active').default(true).notNull(),
    isAvailable: boolean('is_available').default(true).notNull(),
    isFeatured: boolean('is_featured').default(false).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('products_slug_uidx').on(table.slug),
    index('products_category_id_idx').on(table.categoryId),
    check('products_price_nonnegative', sql`${table.priceToman} >= 0`),
    check(
      'products_compare_price_nonnegative',
      sql`${table.compareAtPriceToman} is null or ${table.compareAtPriceToman} >= 0`,
    ),
  ],
);

export const productImages = pgTable(
  'product_images',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    altText: text('alt_text').notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    isPrimary: boolean('is_primary').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('product_images_product_id_idx').on(table.productId),
    unique('product_images_product_url_uq').on(table.productId, table.url),
  ],
);

export const optionGroups = pgTable(
  'option_groups',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    selectionType: selectionTypeEnum('selection_type')
      .default('multiple')
      .notNull(),
    minSelect: integer('min_select').default(0).notNull(),
    maxSelect: integer('max_select'),
    isRequired: boolean('is_required').default(false).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    ...timestamps,
  },
  (table) => [
    unique('option_groups_name_uq').on(table.name),
    check('option_groups_min_nonnegative', sql`${table.minSelect} >= 0`),
    check(
      'option_groups_max_valid',
      sql`${table.maxSelect} is null or ${table.maxSelect} >= ${table.minSelect}`,
    ),
  ],
);

export const options = pgTable(
  'options',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    optionGroupId: uuid('option_group_id')
      .notNull()
      .references(() => optionGroups.id, { onDelete: 'restrict' }),
    name: text('name').notNull(),
    priceDeltaToman: integer('price_delta_toman').default(0).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    ...timestamps,
  },
  (table) => [
    index('options_option_group_id_idx').on(table.optionGroupId),
    unique('options_group_name_uq').on(table.optionGroupId, table.name),
    check('options_price_nonnegative', sql`${table.priceDeltaToman} >= 0`),
  ],
);

export const productOptionGroups = pgTable(
  'product_option_groups',
  {
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    optionGroupId: uuid('option_group_id')
      .notNull()
      .references(() => optionGroups.id, { onDelete: 'restrict' }),
    sortOrder: integer('sort_order').default(0).notNull(),
  },
  (table) => [primaryKey({ columns: [table.productId, table.optionGroupId] })],
);

export const coupons = pgTable(
  'coupons',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    code: text('code').notNull(),
    type: couponTypeEnum('type').notNull(),
    value: integer('value').notNull(),
    maxDiscountToman: integer('max_discount_toman'),
    minOrderToman: integer('min_order_toman'),
    startsAt: timestamp('starts_at', { withTimezone: true }),
    endsAt: timestamp('ends_at', { withTimezone: true }),
    usageLimit: integer('usage_limit'),
    usageCount: integer('usage_count').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('coupons_code_uidx').on(table.code),
    check('coupons_value_nonnegative', sql`${table.value} >= 0`),
    check(
      'coupons_percentage_valid',
      sql`${table.type} <> 'percentage' or ${table.value} <= 100`,
    ),
    check(
      'coupons_limits_nonnegative',
      sql`(${table.maxDiscountToman} is null or ${table.maxDiscountToman} >= 0) and (${table.minOrderToman} is null or ${table.minOrderToman} >= 0) and (${table.usageLimit} is null or ${table.usageLimit} >= 0)`,
    ),
    check('coupons_usage_nonnegative', sql`${table.usageCount} >= 0`),
  ],
);

export const restaurantSettings = pgTable(
  'restaurant_settings',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    restaurantName: text('restaurant_name').notNull(),
    phone: text('phone').notNull(),
    instagram: text('instagram').notNull(),
    city: text('city').notNull(),
    deliveryEnabled: boolean('delivery_enabled').default(true).notNull(),
    pickupEnabled: boolean('pickup_enabled').default(true).notNull(),
    defaultDeliveryFeeToman: integer('default_delivery_fee_toman')
      .default(0)
      .notNull(),
    minimumOrderToman: integer('minimum_order_toman'),
    ordersEnabled: boolean('orders_enabled').default(true).notNull(),
    ...timestamps,
  },
  (table) => [
    check(
      'restaurant_delivery_fee_nonnegative',
      sql`${table.defaultDeliveryFeeToman} >= 0`,
    ),
    check(
      'restaurant_minimum_nonnegative',
      sql`${table.minimumOrderToman} is null or ${table.minimumOrderToman} >= 0`,
    ),
  ],
);

export const openingHours = pgTable(
  'opening_hours',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    dayOfWeek: integer('day_of_week').notNull(),
    openTime: time('open_time'),
    closeTime: time('close_time'),
    isClosed: boolean('is_closed').default(false).notNull(),
    ...timestamps,
  },
  (table) => [
    unique('opening_hours_day_uq').on(table.dayOfWeek),
    check('opening_hours_day_valid', sql`${table.dayOfWeek} between 0 and 6`),
  ],
);

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    clientOrderId: uuid('client_order_id').notNull(),
    publicNumber: text('public_number').notNull(),
    trackingTokenHash: text('tracking_token_hash').notNull(),
    status: orderStatusEnum('status').default('submitted').notNull(),
    fulfillmentType: fulfillmentTypeEnum('fulfillment_type').notNull(),
    paymentMethod: paymentMethodEnum('payment_method').notNull(),
    paymentStatus: paymentStatusEnum('payment_status')
      .default('unpaid')
      .notNull(),
    customerName: text('customer_name').notNull(),
    mobile: text('mobile').notNull(),
    address: text('address'),
    plaque: text('plaque'),
    unit: text('unit'),
    addressNote: text('address_note'),
    requestedTime: text('requested_time'),
    customerNote: text('customer_note'),
    subtotalToman: integer('subtotal_toman').notNull(),
    discountToman: integer('discount_toman').default(0).notNull(),
    deliveryFeeToman: integer('delivery_fee_toman').default(0).notNull(),
    totalToman: integer('total_toman').notNull(),
    couponCode: text('coupon_code'),
    ...timestamps,
    confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
    preparingAt: timestamp('preparing_at', { withTimezone: true }),
    readyAt: timestamp('ready_at', { withTimezone: true }),
    dispatchedAt: timestamp('dispatched_at', { withTimezone: true }),
    deliveredAt: timestamp('delivered_at', { withTimezone: true }),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('orders_client_order_id_uidx').on(table.clientOrderId),
    uniqueIndex('orders_public_number_uidx').on(table.publicNumber),
    index('orders_status_idx').on(table.status),
    index('orders_created_at_idx').on(table.createdAt),
    check('orders_subtotal_nonnegative', sql`${table.subtotalToman} >= 0`),
    check('orders_discount_nonnegative', sql`${table.discountToman} >= 0`),
    check(
      'orders_delivery_fee_nonnegative',
      sql`${table.deliveryFeeToman} >= 0`,
    ),
    check('orders_total_nonnegative', sql`${table.totalToman} >= 0`),
  ],
);

export const paymentAttempts = pgTable(
  'payment_attempts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'restrict' }),
    provider: text('provider').notNull(),
    amountToman: integer('amount_toman').notNull(),
    status: paymentAttemptStatusEnum('status').default('created').notNull(),
    providerReference: text('provider_reference'),
    transactionReference: text('transaction_reference'),
    failureCode: text('failure_code'),
    ...timestamps,
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
  },
  (table) => [
    index('payment_attempts_order_id_idx').on(table.orderId),
    index('payment_attempts_status_idx').on(table.status),
    check(
      'payment_attempts_amount_nonnegative',
      sql`${table.amountToman} >= 0`,
    ),
  ],
);

export const paymentSettings = pgTable('payment_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  onlinePaymentEnabled: boolean('online_payment_enabled')
    .default(false)
    .notNull(),
  provider: text('provider'),
  ...timestamps,
});

export const notificationOutbox = pgTable(
  'notification_outbox',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    channel: notificationChannelEnum('channel').default('sms').notNull(),
    eventType: text('event_type').notNull(),
    orderId: uuid('order_id').references(() => orders.id, {
      onDelete: 'set null',
    }),
    recipient: text('recipient').notNull(),
    templateKey: text('template_key').notNull(),
    payload: jsonb('payload')
      .$type<Record<string, string>>()
      .default({})
      .notNull(),
    status: notificationStatusEnum('status').default('pending').notNull(),
    provider: text('provider'),
    providerMessageId: text('provider_message_id'),
    attempts: integer('attempts').default(0).notNull(),
    nextAttemptAt: timestamp('next_attempt_at', { withTimezone: true }),
    lastErrorCode: text('last_error_code'),
    ...timestamps,
    sentAt: timestamp('sent_at', { withTimezone: true }),
  },
  (table) => [
    index('notification_outbox_status_next_idx').on(
      table.status,
      table.nextAttemptAt,
    ),
    index('notification_outbox_order_id_idx').on(table.orderId),
    index('notification_outbox_created_at_idx').on(table.createdAt),
  ],
);

export const notificationSettings = pgTable('notification_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  smsEnabled: boolean('sms_enabled').default(false).notNull(),
  provider: text('provider'),
  notifyOrderSubmitted: boolean('notify_order_submitted')
    .default(true)
    .notNull(),
  notifyOrderConfirmed: boolean('notify_order_confirmed')
    .default(true)
    .notNull(),
  notifyOrderReady: boolean('notify_order_ready').default(true).notNull(),
  notifyOrderDispatched: boolean('notify_order_dispatched')
    .default(true)
    .notNull(),
  notifyOrderCancelled: boolean('notify_order_cancelled')
    .default(true)
    .notNull(),
  ...timestamps,
});

export const serviceHeartbeats = pgTable('service_heartbeats', {
  serviceName: text('service_name').primaryKey(),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  metadata: jsonb('metadata')
    .$type<Record<string, unknown>>()
    .default({})
    .notNull(),
});

export const orderItems = pgTable(
  'order_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'restrict' }),
    productId: uuid('product_id').references(() => products.id, {
      onDelete: 'set null',
    }),
    productTitleSnapshot: text('product_title_snapshot').notNull(),
    unitPriceToman: integer('unit_price_toman').notNull(),
    quantity: integer('quantity').notNull(),
    lineSubtotalToman: integer('line_subtotal_toman').notNull(),
    lineOptionsTotalToman: integer('line_options_total_toman').notNull(),
    lineTotalToman: integer('line_total_toman').notNull(),
    note: text('note'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('order_items_order_id_idx').on(table.orderId),
    check('order_items_quantity_positive', sql`${table.quantity} > 0`),
    check(
      'order_items_prices_nonnegative',
      sql`${table.unitPriceToman} >= 0 and ${table.lineSubtotalToman} >= 0 and ${table.lineOptionsTotalToman} >= 0 and ${table.lineTotalToman} >= 0`,
    ),
  ],
);

export const orderItemOptions = pgTable(
  'order_item_options',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderItemId: uuid('order_item_id')
      .notNull()
      .references(() => orderItems.id, { onDelete: 'restrict' }),
    optionId: uuid('option_id').references(() => options.id, {
      onDelete: 'set null',
    }),
    optionNameSnapshot: text('option_name_snapshot').notNull(),
    priceDeltaToman: integer('price_delta_toman').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('order_item_options_item_id_idx').on(table.orderItemId),
    check(
      'order_item_options_price_nonnegative',
      sql`${table.priceDeltaToman} >= 0`,
    ),
  ],
);

export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
export type AdminRole = (typeof adminRoleEnum.enumValues)[number];
