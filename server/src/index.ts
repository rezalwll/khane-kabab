import { serve } from '@hono/node-server';
import pino from 'pino';
import { createApp } from './app.js';
import { loadEnv } from './config/env.js';
import { createDatabase } from './db/client.js';
const env=loadEnv();const logger=pino({level:env.LOG_LEVEL});const {db,pool}=createDatabase(env);const app=createApp({db,env,logger});
const server=serve({fetch:app.fetch,port:env.PORT},(info)=>logger.info({port:info.port},'API server started'));
const shutdown=async()=>{logger.info('Shutting down API server');server.close();await pool.end()};process.once('SIGINT',shutdown);process.once('SIGTERM',shutdown);
