import pino from 'pino';
import { loadEnv } from '../config/env.js';
import { createDatabase } from '../db/client.js';
import { reportUnexpectedError } from '../lib/report-error.js';
import { workNotifications } from '../modules/notifications/worker.js';

const env = loadEnv();
const logger = pino({ level: env.LOG_LEVEL });
const { db, pool } = createDatabase(env);
let stopping = false;
let failures = 0;

const stop = (signal: string) => {
  if (stopping) return;
  stopping = true;
  logger.info({ signal }, 'notification worker stopping');
};
process.once('SIGTERM', () => stop('SIGTERM'));
process.once('SIGINT', () => stop('SIGINT'));

logger.info('notification worker started');
while (!stopping) {
  try {
    await workNotifications(db, env);
    failures = 0;
  } catch (error) {
    failures++;
    reportUnexpectedError(logger, error, {
      area: 'notification-worker',
      consecutiveFailures: failures,
    });
  }
  const delayMs = failures
    ? Math.min(60_000, 5_000 * 2 ** Math.min(failures - 1, 4))
    : 7_000;
  await new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, delayMs);
    const check = setInterval(() => {
      if (stopping) {
        clearTimeout(timer);
        clearInterval(check);
        resolve();
      }
    }, 250);
  });
}
await pool.end();
logger.info('notification worker stopped');
