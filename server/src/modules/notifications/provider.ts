import type { Env } from '../../config/env.js';
export interface SmsProvider {
  name: string;
  isConfigured(): boolean;
  send(input: {
    mobile: string;
    message: string;
    idempotencyKey: string;
  }): Promise<{ providerMessageId?: string }>;
}
export type SmsEnv = Pick<
  Env,
  'SMS_PROVIDER' | 'SMS_PROVIDER_CONFIGURED' | 'NODE_ENV'
>;
export type NotificationEvent =
  | 'ORDER_SUBMITTED'
  | 'ORDER_CONFIRMED'
  | 'ORDER_READY_PICKUP'
  | 'ORDER_DISPATCHED'
  | 'ORDER_CANCELLED'
  | 'PAYMENT_CONFIRMED';
