import { loadEnv } from '../config/env.js';
import { createDatabase } from '../db/client.js';
import { workNotifications } from '../modules/notifications/worker.js';
const env = loadEnv();
const { db, pool } = createDatabase(env);
try {
  console.log(
    JSON.stringify({
      level: 'info',
      message: 'Notification worker complete',
      ...(await workNotifications(db, env)),
    }),
  );
} finally {
  await pool.end();
}
