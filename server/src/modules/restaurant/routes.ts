import { asc } from 'drizzle-orm';
import { Hono } from 'hono';
import type { AppDb } from '../../db/client.js';
import type { Env } from '../../config/env.js';
import { openingHours, restaurantSettings } from '../../db/schema.js';
import { getNotificationCapability } from '../notifications/service.js';
import { getPaymentCapability } from '../payments/service.js';

export function restaurantRoutes(db: AppDb, env: Env) {
  return new Hono().get('/', async (c) => {
    const [settings] = await db
      .select({
        restaurantName: restaurantSettings.restaurantName,
        phone: restaurantSettings.phone,
        instagram: restaurantSettings.instagram,
        city: restaurantSettings.city,
        ordersEnabled: restaurantSettings.ordersEnabled,
        deliveryEnabled: restaurantSettings.deliveryEnabled,
        pickupEnabled: restaurantSettings.pickupEnabled,
        defaultDeliveryFeeToman: restaurantSettings.defaultDeliveryFeeToman,
        minimumOrderToman: restaurantSettings.minimumOrderToman,
      })
      .from(restaurantSettings)
      .limit(1);
    const hours = await db
      .select({
        dayOfWeek: openingHours.dayOfWeek,
        openTime: openingHours.openTime,
        closeTime: openingHours.closeTime,
        isClosed: openingHours.isClosed,
      })
      .from(openingHours)
      .orderBy(asc(openingHours.dayOfWeek));
    const payment = await getPaymentCapability(db, env);
    const notifications = await getNotificationCapability(db, env);
    return c.json({
      restaurant: settings
        ? {
            ...settings,
            openingHours: hours,
            capabilities: {
              onlinePayment: payment.effectiveEnabled,
              smsNotifications: notifications.effectiveEnabled,
            },
          }
        : null,
    });
  });
}
