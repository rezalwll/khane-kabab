import { serve } from '@hono/node-server';
import pino from 'pino';
import { createApp } from './app.js';
import { loadEnv } from './config/env.js';
import { createDatabase } from './db/client.js';
const env = loadEnv();
const logger = pino({ level: env.LOG_LEVEL });
const { db, pool } = createDatabase(env);
const app = createApp({ db, env, logger });
const server = serve({ fetch: app.fetch, port: env.PORT }, (info) =>
  logger.info({ port: info.port }, 'API server started'),
);
let shuttingDown = false;
const shutdown = async (signal: string) => {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, 'Shutting down API server');
  const forced = setTimeout(() => {
    logger.error('Graceful shutdown timed out');
    process.exit(1);
  }, 10_000);
  forced.unref();
  await new Promise<void>((resolve) => server.close(() => resolve()));
  await pool.end();
  clearTimeout(forced);
  logger.info('API server stopped');
  process.exit(0);
};
process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));
