import { ApiError } from '../../lib/errors.js';
import type { SmsProvider } from './provider.js';
export class DisabledSmsProvider implements SmsProvider {
  name = 'disabled';
  isConfigured() {
    return false;
  }
  async send(): Promise<never> {
    throw new ApiError(
      503,
      'SMS_PROVIDER_NOT_CONFIGURED',
      'سرویس پیامک هنوز متصل نیست.',
    );
  }
}
