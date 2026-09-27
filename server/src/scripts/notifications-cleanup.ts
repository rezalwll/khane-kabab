import { and, inArray, lt } from 'drizzle-orm';
import { loadEnv } from '../config/env.js';
import { createDatabase } from '../db/client.js';
import { notificationOutbox } from '../db/schema.js';

const env = loadEnv();
const { db, pool } = createDatabase(env);
try {
  const cutoff = new Date(
    Date.now() - env.NOTIFICATION_RETENTION_DAYS * 24 * 60 * 60 * 1000,
  );
  const deleted = await db
    .delete(notificationOutbox)
    .where(
      and(
        inArray(notificationOutbox.status, ['sent', 'skipped']),
        lt(notificationOutbox.createdAt, cutoff),
      ),
    )
    .returning({ id: notificationOutbox.id });
  console.log(
    JSON.stringify({
      level: 'info',
      message: 'Notification cleanup complete',
      deleted: deleted.length,
      retentionDays: env.NOTIFICATION_RETENTION_DAYS,
    }),
  );
} finally {
  await pool.end();
}
