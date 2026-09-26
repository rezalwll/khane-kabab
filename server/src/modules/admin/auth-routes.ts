import { and, eq, isNull } from 'drizzle-orm';
import { Hono } from 'hono';
import { deleteCookie, setCookie } from 'hono/cookie';
import { z } from 'zod';
import type { Env } from '../../config/env.js';
import type { AppDb } from '../../db/client.js';
import { adminSessions, adminUsers } from '../../db/schema.js';
import { ApiError } from '../../lib/errors.js';
import type { AppVariables } from '../../middleware/request-id.js';
import { writeAudit } from './audit.js';
import { ADMIN_COOKIE, requireAdmin } from './middleware.js';
import {
  createSessionToken,
  hashPassword,
  hashSessionToken,
  verifyPassword,
} from './security.js';
import type { AdminVariables } from './types.js';
import { isAccountUsable, nextLoginFailure } from './auth-policy.js';

const loginSchema = z.object({
  username: z.string().trim().min(1).max(64),
  password: z.string().min(1).max(256),
});
const passwordSchema = z.object({
  currentPassword: z.string().min(1).max(256),
  newPassword: z.string().min(12).max(256),
});
const genericError = () =>
  new ApiError(
    401,
    'INVALID_CREDENTIALS',
    'نام کاربری یا رمز عبور نادرست است.',
  );

function cookieOptions(env: Env) {
  return {
    httpOnly: true,
    secure: env.ADMIN_COOKIE_SECURE,
    sameSite: 'Lax' as const,
    path: '/api/v1/admin',
    maxAge: env.ADMIN_SESSION_TTL_HOURS * 3600,
    ...(env.ADMIN_COOKIE_DOMAIN ? { domain: env.ADMIN_COOKIE_DOMAIN } : {}),
  };
}
const safeProfile = (user: {
  id: string;
  username: string;
  displayName: string;
  role: string;
}) => ({
  id: user.id,
  username: user.username,
  displayName: user.displayName,
  role: user.role,
});

export function adminAuthRoutes(db: AppDb, env: Env) {
  const app = new Hono<{ Variables: AppVariables & AdminVariables }>();
  app.post('/login', async (c) => {
    const parsed = loginSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw genericError();
    const username = parsed.data.username.toLowerCase();
    const [user] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, username))
      .limit(1);
    const valid = user
      ? await verifyPassword(parsed.data.password, user.passwordHash)
      : false;
    const now = new Date();
    if (!user || !isAccountUsable(user, now) || !valid) {
      if (user && isAccountUsable(user, now)) {
        const failure = nextLoginFailure(user.failedLoginCount, now);
        await db
          .update(adminUsers)
          .set({
            ...failure,
            updatedAt: now,
          })
          .where(eq(adminUsers.id, user.id));
      }
      await writeAudit(db, {
        adminUserId: user?.id,
        action: 'ADMIN_LOGIN_FAILED',
        entityType: 'admin_user',
        entityId: user?.id,
        requestId: c.get('requestId'),
        metadata: { username },
      });
      throw genericError();
    }
    const rawToken = createSessionToken();
    const expiresAt = new Date(
      now.getTime() + env.ADMIN_SESSION_TTL_HOURS * 3_600_000,
    );
    await db.transaction(async (tx) => {
      await tx
        .update(adminUsers)
        .set({
          failedLoginCount: 0,
          lockedUntil: null,
          lastLoginAt: now,
          updatedAt: now,
        })
        .where(eq(adminUsers.id, user.id));
      await tx.insert(adminSessions).values({
        adminUserId: user.id,
        tokenHash: hashSessionToken(rawToken),
        expiresAt,
        userAgent: c.req.header('user-agent')?.slice(0, 255),
      });
    });
    setCookie(c, ADMIN_COOKIE, rawToken, cookieOptions(env));
    await writeAudit(db, {
      adminUserId: user.id,
      action: 'ADMIN_LOGIN_SUCCEEDED',
      entityType: 'admin_user',
      entityId: user.id,
      requestId: c.get('requestId'),
    });
    c.header('Cache-Control', 'no-store');
    return c.json({ user: safeProfile(user) });
  });
  app.use('/me', requireAdmin(db));
  app.get('/me', (c) => c.json({ user: safeProfile(c.get('admin')) }));
  app.use('/logout', requireAdmin(db));
  app.post('/logout', async (c) => {
    const admin = c.get('admin');
    await db
      .update(adminSessions)
      .set({ revokedAt: new Date() })
      .where(eq(adminSessions.id, admin.sessionId));
    deleteCookie(c, ADMIN_COOKIE, {
      path: '/api/v1/admin',
      secure: env.ADMIN_COOKIE_SECURE,
      ...(env.ADMIN_COOKIE_DOMAIN ? { domain: env.ADMIN_COOKIE_DOMAIN } : {}),
    });
    await writeAudit(db, {
      adminUserId: admin.id,
      action: 'ADMIN_LOGOUT',
      entityType: 'admin_session',
      entityId: admin.sessionId,
      requestId: c.get('requestId'),
    });
    return c.json({ ok: true });
  });
  app.use('/change-password', requireAdmin(db));
  app.post('/change-password', async (c) => {
    const parsed = passwordSchema.safeParse(
      await c.req.json().catch(() => null),
    );
    if (!parsed.success)
      throw new ApiError(
        422,
        'VALIDATION_ERROR',
        parsed.error.issues[0]?.message ?? 'رمز جدید معتبر نیست.',
      );
    const admin = c.get('admin');
    const [user] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, admin.id))
      .limit(1);
    if (
      !user ||
      !(await verifyPassword(parsed.data.currentPassword, user.passwordHash))
    )
      throw genericError();
    const newHash = await hashPassword(parsed.data.newPassword);
    const newToken = createSessionToken();
    const now = new Date();
    await db.transaction(async (tx) => {
      await tx
        .update(adminUsers)
        .set({ passwordHash: newHash, updatedAt: now })
        .where(eq(adminUsers.id, admin.id));
      await tx
        .update(adminSessions)
        .set({ revokedAt: now })
        .where(
          and(
            eq(adminSessions.adminUserId, admin.id),
            isNull(adminSessions.revokedAt),
          ),
        );
      await tx.insert(adminSessions).values({
        adminUserId: admin.id,
        tokenHash: hashSessionToken(newToken),
        expiresAt: new Date(
          now.getTime() + env.ADMIN_SESSION_TTL_HOURS * 3_600_000,
        ),
        userAgent: c.req.header('user-agent')?.slice(0, 255),
      });
    });
    setCookie(c, ADMIN_COOKIE, newToken, cookieOptions(env));
    await writeAudit(db, {
      adminUserId: admin.id,
      action: 'ADMIN_PASSWORD_CHANGED',
      entityType: 'admin_user',
      entityId: admin.id,
      requestId: c.get('requestId'),
    });
    return c.json({ ok: true });
  });
  return app;
}
