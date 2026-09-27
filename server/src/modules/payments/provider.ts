import type { Env } from '../../config/env.js';
export type CreatePaymentInput = {
  publicNumber: string;
  amountToman: number;
  callbackUrl: string;
};
export type VerifyPaymentInput = {
  providerReference?: string;
  query: Record<string, string>;
};
export interface PaymentProvider {
  name: string;
  isConfigured(): boolean;
  createPayment(
    input: CreatePaymentInput,
  ): Promise<{ providerReference: string; redirectUrl: string }>;
  verifyPayment(input: VerifyPaymentInput): Promise<{
    verified: boolean;
    transactionReference?: string;
    amountToman?: number;
  }>;
}
export type PaymentCapability = {
  provider: string;
  configured: boolean;
  enabled: boolean;
  effectiveEnabled: boolean;
};
export type PaymentEnv = Pick<
  Env,
  | 'PAYMENT_PROVIDER'
  | 'PAYMENT_PROVIDER_CONFIGURED'
  | 'PAYMENT_CALLBACK_BASE_URL'
  | 'NODE_ENV'
>;
