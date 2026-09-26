import { describe,expect,it } from 'vitest';
import { ApiError } from './errors.js';
import { normalizeIranianMobile } from './phone.js';
import { createOrderToken,hashOrderToken,verifyOrderToken } from './order-token.js';
import { canTransitionOrder } from '../modules/orders/status-transitions.js';
describe('phone',()=>{it.each([['09123456789','+989123456789'],['+989123456789','+989123456789'],['989123456789','+989123456789'],['۰۹۱۲۳۴۵۶۷۸۹','+989123456789']])('normalizes %s',(input,expected)=>expect(normalizeIranianMobile(input)).toBe(expected));it('rejects invalid numbers',()=>expect(()=>normalizeIranianMobile('123')).toThrow(ApiError))});
describe('tracking token',()=>{it('stores/verifies only a hash',()=>{const token=createOrderToken();const hash=hashOrderToken(token);expect(hash).not.toContain(token);expect(verifyOrderToken(token,hash)).toBe(true);expect(verifyOrderToken(`${token}x`,hash)).toBe(false)})});
describe('status transitions',()=>{it('allows the defined path only',()=>{expect(canTransitionOrder('submitted','confirmed')).toBe(true);expect(canTransitionOrder('submitted','delivered')).toBe(false);expect(canTransitionOrder('ready','delivered')).toBe(true)})});
