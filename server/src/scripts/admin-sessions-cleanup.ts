import { and, isNotNull, lt, or } from 'drizzle-orm';
import { loadEnv } from '../config/env.js';
import { createDatabase } from '../db/client.js';
import { adminSessions } from '../db/schema.js';
const env = loadEnv();
const { db, pool } = createDatabase(env);
try {
  const revokedCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const removed = await db
    .delete(adminSessions)
    .where(
      or(
        lt(adminSessions.expiresAt, new Date()),
        and(
          isNotNull(adminSessions.revokedAt),
          lt(adminSessions.revokedAt, revokedCutoff),
        ),
      ),
    )
    .returning({ id: adminSessions.id });
  console.log(
    JSON.stringify({
      level: 'info',
      message: 'Admin session cleanup completed',
      removed: removed.length,
    }),
  );
} finally {
  await pool.end();
}
