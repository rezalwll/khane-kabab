export const MAX_LOGIN_FAILURES = 5;
export const LOCKOUT_MS = 15 * 60_000;
export function nextLoginFailure(failedLoginCount: number, now = new Date()) {
  const failures = failedLoginCount + 1;
  return failures >= MAX_LOGIN_FAILURES
    ? { failedLoginCount: 0, lockedUntil: new Date(now.getTime() + LOCKOUT_MS) }
    : { failedLoginCount: failures, lockedUntil: null };
}
export const isAccountUsable = (
  account: { isActive: boolean; lockedUntil: Date | null },
  now = new Date(),
) => account.isActive && (!account.lockedUntil || account.lockedUntil <= now);
export const isSessionUsable = (
  session: { expiresAt: Date; revokedAt: Date | null },
  now = new Date(),
) => session.revokedAt === null && session.expiresAt > now;
export const isTrustedMutationOrigin = (
  method: string,
  origin: string | undefined,
  allowed: string[],
) =>
  ['GET', 'HEAD', 'OPTIONS'].includes(method) ||
  Boolean(origin && allowed.includes(origin));
