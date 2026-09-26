import { and, eq, gt, isNull } from 'drizzle-orm';
import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import type { AppDb } from '../../db/client.js';
import { adminSessions, adminUsers } from '../../db/schema.js';
import type { Env } from '../../config/env.js';
import { ApiError } from '../../lib/errors.js';
import type { AppVariables } from '../../middleware/request-id.js';
import { hashSessionToken } from './security.js';
import { hasPermission, type AdminPermission } from './permissions.js';
import type { AdminVariables } from './types.js';
import { isTrustedMutationOrigin } from './auth-policy.js';

export const ADMIN_COOKIE = 'kk_admin_session';
type Variables = AppVariables & AdminVariables;

export function adminOriginGuard(env: Env) {
  return createMiddleware(async (c, next) => {
    if (
      !isTrustedMutationOrigin(
        c.req.method,
        c.req.header('origin'),
        env.adminOrigins,
      )
    )
      throw new ApiError(403, 'FORBIDDEN', 'منشأ درخواست معتبر نیست.');
    await next();
  });
}

export function requireAdmin(db: AppDb) {
  return createMiddleware<{ Variables: Variables }>(async (c, next) => {
    const token = getCookie(c, ADMIN_COOKIE);
    if (!token)
      throw new ApiError(401, 'AUTH_REQUIRED', 'ورود به حساب مدیریت لازم است.');
    const [row] = await db
      .select({
        sessionId: adminSessions.id,
        userId: adminUsers.id,
        username: adminUsers.username,
        displayName: adminUsers.displayName,
        role: adminUsers.role,
      })
      .from(adminSessions)
      .innerJoin(adminUsers, eq(adminSessions.adminUserId, adminUsers.id))
      .where(
        and(
          eq(adminSessions.tokenHash, hashSessionToken(token)),
          isNull(adminSessions.revokedAt),
          gt(adminSessions.expiresAt, new Date()),
          eq(adminUsers.isActive, true),
        ),
      )
      .limit(1);
    if (!row)
      throw new ApiError(
        401,
        'SESSION_EXPIRED',
        'نشست شما معتبر نیست. دوباره وارد شوید.',
      );
    c.set('admin', {
      id: row.userId,
      username: row.username,
      displayName: row.displayName,
      role: row.role,
      sessionId: row.sessionId,
    });
    await db
      .update(adminSessions)
      .set({ lastSeenAt: new Date() })
      .where(eq(adminSessions.id, row.sessionId));
    await next();
    c.header('Cache-Control', 'no-store');
  });
}

export function requirePermission(permission: AdminPermission) {
  return createMiddleware<{ Variables: Variables }>(async (c, next) => {
    if (!hasPermission(c.get('admin').role, permission))
      throw new ApiError(
        403,
        'FORBIDDEN',
        'شما اجازه انجام این عملیات را ندارید.',
      );
    await next();
  });
}
