import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import type { Env } from '../config/env.js';
import * as schema from './schema.js';

export function createDatabase(env: Pick<Env, 'DATABASE_URL' | 'NODE_ENV'>) {
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: env.NODE_ENV === 'production' ? 20 : 5,
  });
  return { pool, db: drizzle(pool, { schema }) };
}

export type AppDb = ReturnType<typeof createDatabase>['db'];
export type QueryDb = Pick<AppDb, 'select'>;
