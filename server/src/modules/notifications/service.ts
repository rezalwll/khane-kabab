import type { AppDb } from '../../db/client.js';
import type { Env } from '../../config/env.js';
import { notificationOutbox, notificationSettings } from '../../db/schema.js';
import { DisabledSmsProvider } from './disabled-provider.js';
import type { NotificationEvent, SmsProvider } from './provider.js';
import type { TemplateKey } from './templates.js';
type NotificationDb = Pick<AppDb, 'select' | 'insert'>;
export function getSmsProvider(env: Env): SmsProvider {
  if (env.SMS_PROVIDER === 'test' && env.NODE_ENV !== 'test')
    throw new Error('The test SMS provider is forbidden outside tests');
  return new DisabledSmsProvider();
}
export async function getNotificationCapability(
  db: Pick<AppDb, 'select'>,
  env: Env,
) {
  const [settings] = await db.select().from(notificationSettings).limit(1);
  const provider = getSmsProvider(env);
  const enabled = settings?.smsEnabled ?? false;
  const configured = env.SMS_PROVIDER_CONFIGURED && provider.isConfigured();
  return {
    provider: provider.name,
    configured,
    enabled,
    effectiveEnabled: enabled && configured,
    settings: settings ?? null,
  };
}
const mapping: Record<
  NotificationEvent,
  {
    field:
      | 'notifyOrderSubmitted'
      | 'notifyOrderConfirmed'
      | 'notifyOrderReady'
      | 'notifyOrderDispatched'
      | 'notifyOrderCancelled';
    templateKey: TemplateKey;
  } | null
> = {
  ORDER_SUBMITTED: {
    field: 'notifyOrderSubmitted',
    templateKey: 'ORDER_SUBMITTED',
  },
  ORDER_CONFIRMED: {
    field: 'notifyOrderConfirmed',
    templateKey: 'ORDER_CONFIRMED',
  },
  ORDER_READY_PICKUP: {
    field: 'notifyOrderReady',
    templateKey: 'READY_PICKUP',
  },
  ORDER_DISPATCHED: {
    field: 'notifyOrderDispatched',
    templateKey: 'DISPATCHED',
  },
  ORDER_CANCELLED: { field: 'notifyOrderCancelled', templateKey: 'CANCELLED' },
  PAYMENT_CONFIRMED: null,
};
export async function enqueueNotificationIfEnabled(
  db: NotificationDb,
  env: Env,
  input: {
    eventType: NotificationEvent;
    orderId: string;
    recipient: string;
    publicNumber: string;
  },
) {
  const capability = await getNotificationCapability(db, env);
  const rule = mapping[input.eventType];
  if (
    !capability.effectiveEnabled ||
    !rule ||
    !capability.settings?.[rule.field]
  )
    return false;
  await db.insert(notificationOutbox).values({
    eventType: input.eventType,
    orderId: input.orderId,
    recipient: input.recipient,
    templateKey: rule.templateKey,
    payload: { publicNumber: input.publicNumber },
    provider: capability.provider,
  });
  return true;
}
export const maskMobile = (value: string) =>
  value.length < 7 ? '••••' : `${value.slice(0, 4)}•••${value.slice(-3)}`;
