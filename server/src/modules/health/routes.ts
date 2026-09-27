import { Hono } from 'hono';
import { sql } from 'drizzle-orm';
import type pino from 'pino';
import type { AppDb } from '../../db/client.js';
import type { Env } from '../../config/env.js';
import { reportUnexpectedError } from '../../lib/report-error.js';
export const healthRoutes = new Hono().get('/', (c) =>
  c.json({ status: 'ok' }),
);
export function readinessRoutes(db: AppDb, env: Env, logger: pino.Logger) {
  return new Hono().get('/', async (c) => {
    try {
      await db.execute(sql`select 1`);
      return c.json({
        status: 'ready',
        database: 'ready',
        version: env.APP_VERSION,
        gitSha: env.GIT_SHA,
      });
    } catch (error) {
      reportUnexpectedError(logger, error, { area: 'readiness' });
      return c.json(
        {
          status: 'not_ready',
          database: 'unavailable',
          version: env.APP_VERSION,
          gitSha: env.GIT_SHA,
        },
        503,
      );
    }
  });
}
