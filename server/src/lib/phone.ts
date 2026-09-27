import { ApiError } from './errors.js';

const normalizeDigits = (value: string) =>
  value
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));

export function normalizeIranianMobile(input: string): string {
  const digits = normalizeDigits(input).replace(/[\s()-]/g, '');
  const normalized = digits.startsWith('+98')
    ? digits
    : digits.startsWith('98')
      ? `+${digits}`
      : digits.startsWith('09')
        ? `+98${digits.slice(1)}`
        : '';
  if (!/^\+989\d{9}$/.test(normalized))
    throw new ApiError(422, 'INVALID_MOBILE', 'شماره موبایل معتبر نیست.');
  return normalized;
}
