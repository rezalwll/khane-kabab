import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import type { Env } from '../config/env.js';
import * as schema from './schema.js';

export function createDatabase(
  env: Pick<
    Env,
    | 'DATABASE_URL'
    | 'DB_POOL_MAX'
    | 'DB_IDLE_TIMEOUT_MS'
    | 'DB_CONNECTION_TIMEOUT_MS'
    | 'DATABASE_SSL_MODE'
  >,
) {
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: env.DB_POOL_MAX,
    idleTimeoutMillis: env.DB_IDLE_TIMEOUT_MS,
    connectionTimeoutMillis: env.DB_CONNECTION_TIMEOUT_MS,
    ssl: env.DATABASE_SSL_MODE === 'require' ? true : undefined,
  });
  return { pool, db: drizzle(pool, { schema }) };
}

export type AppDb = ReturnType<typeof createDatabase>['db'];
export type QueryDb = Pick<AppDb, 'select'>;
