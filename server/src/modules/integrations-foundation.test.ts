import { describe, expect, it } from 'vitest';
import { ApiError } from '../lib/errors.js';
import { DisabledSmsProvider } from './notifications/disabled-provider.js';
import { renderSmsTemplate } from './notifications/templates.js';
import { DisabledPaymentProvider } from './payments/disabled-provider.js';

describe('provider-safe integration foundation', () => {
  it('never treats the disabled payment provider as configured', async () => {
    const provider = new DisabledPaymentProvider();
    expect(provider.isConfigured()).toBe(false);
    await expect(provider.createPayment()).rejects.toBeInstanceOf(ApiError);
  });
  it('never sends through the disabled SMS provider', async () => {
    const provider = new DisabledSmsProvider();
    expect(provider.isConfigured()).toBe(false);
    await expect(provider.send()).rejects.toBeInstanceOf(ApiError);
  });
  it('renders event templates without exposing private order data', () => {
    const result = renderSmsTemplate('ORDER_CONFIRMED', {
      publicNumber: 'KK-123',
    });
    expect(result).toContain('KK-123');
    expect(result).not.toContain('0912');
  });
});
