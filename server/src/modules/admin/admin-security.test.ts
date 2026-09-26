import { describe, expect, it } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  createSessionToken,
  hashSessionToken,
} from './security.js';
import {
  isAccountUsable,
  isSessionUsable,
  isTrustedMutationOrigin,
  nextLoginFailure,
} from './auth-policy.js';
import { hasPermission } from './permissions.js';
import {
  canTransitionOrder,
  canTransitionOrderForFulfillment,
  statusTimestampField,
} from '../orders/status-transitions.js';
describe('admin password security', () => {
  it('hashes and verifies passwords without storing plaintext', async () => {
    const encoded = await hashPassword('a-secure-password-123');
    expect(encoded).toMatch(/^scrypt\$/);
    expect(encoded).not.toContain('a-secure-password-123');
    expect(await verifyPassword('a-secure-password-123', encoded)).toBe(true);
  });
  it('rejects a wrong password and malformed hash', async () => {
    const encoded = await hashPassword('a-secure-password-123');
    expect(await verifyPassword('wrong-password', encoded)).toBe(false);
    expect(await verifyPassword('x', 'invalid')).toBe(false);
  });
});
describe('admin login/session policy', () => {
  const now = new Date('2026-09-26T12:00:00Z');
  it('locks the fifth failed login for 15 minutes', () => {
    expect(nextLoginFailure(3, now)).toEqual({
      failedLoginCount: 4,
      lockedUntil: null,
    });
    expect(nextLoginFailure(4, now)).toEqual({
      failedLoginCount: 0,
      lockedUntil: new Date('2026-09-26T12:15:00Z'),
    });
  });
  it('rejects inactive and currently locked admins', () => {
    expect(isAccountUsable({ isActive: false, lockedUntil: null }, now)).toBe(
      false,
    );
    expect(
      isAccountUsable(
        { isActive: true, lockedUntil: new Date('2026-09-26T12:01:00Z') },
        now,
      ),
    ).toBe(false);
    expect(isAccountUsable({ isActive: true, lockedUntil: null }, now)).toBe(
      true,
    );
  });
  it('rejects expired and revoked sessions', () => {
    expect(
      isSessionUsable(
        { expiresAt: new Date('2026-09-26T11:00:00Z'), revokedAt: null },
        now,
      ),
    ).toBe(false);
    expect(
      isSessionUsable(
        { expiresAt: new Date('2026-09-26T13:00:00Z'), revokedAt: now },
        now,
      ),
    ).toBe(false);
    expect(
      isSessionUsable(
        { expiresAt: new Date('2026-09-26T13:00:00Z'), revokedAt: null },
        now,
      ),
    ).toBe(true);
  });
  it('stores only a SHA-256 token hash', () => {
    const token = createSessionToken();
    const hash = hashSessionToken(token);
    expect(hash).toHaveLength(64);
    expect(hash).not.toContain(token);
    expect(hashSessionToken(token)).toBe(hash);
  });
});
describe('admin authorization and mutation protection', () => {
  it('enforces the role matrix', () => {
    expect(hasPermission('staff', 'orders:write')).toBe(true);
    expect(hasPermission('staff', 'menu:write')).toBe(false);
    expect(hasPermission('staff', 'settings:write')).toBe(false);
    expect(hasPermission('manager', 'menu:write')).toBe(true);
    expect(hasPermission('owner', 'settings:write')).toBe(true);
  });
  it('rejects missing or untrusted mutation origins', () => {
    const allowed = ['http://localhost:3000'];
    expect(isTrustedMutationOrigin('POST', undefined, allowed)).toBe(false);
    expect(
      isTrustedMutationOrigin('PATCH', 'https://evil.example', allowed),
    ).toBe(false);
    expect(
      isTrustedMutationOrigin('PUT', 'http://localhost:3000', allowed),
    ).toBe(true);
    expect(isTrustedMutationOrigin('GET', undefined, allowed)).toBe(true);
  });
});
describe('order status administration', () => {
  it('allows only valid transitions and maps timestamps', () => {
    expect(canTransitionOrder('submitted', 'confirmed')).toBe(true);
    expect(canTransitionOrder('submitted', 'delivered')).toBe(false);
    expect(
      canTransitionOrderForFulfillment('ready', 'dispatched', 'delivery'),
    ).toBe(true);
    expect(
      canTransitionOrderForFulfillment('ready', 'delivered', 'delivery'),
    ).toBe(false);
    expect(
      canTransitionOrderForFulfillment('ready', 'delivered', 'pickup'),
    ).toBe(true);
    expect(statusTimestampField('confirmed')).toBe('confirmedAt');
    expect(statusTimestampField('cancelled')).toBe('cancelledAt');
  });
});
