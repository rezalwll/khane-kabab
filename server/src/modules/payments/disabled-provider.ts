import { ApiError } from '../../lib/errors.js';
import type { PaymentProvider } from './provider.js';
export class DisabledPaymentProvider implements PaymentProvider {
  name = 'disabled';
  isConfigured() {
    return false;
  }
  async createPayment(): Promise<never> {
    throw new ApiError(
      503,
      'PAYMENT_PROVIDER_NOT_CONFIGURED',
      'درگاه پرداخت هنوز متصل نیست.',
    );
  }
  async verifyPayment() {
    return { verified: false };
  }
}
