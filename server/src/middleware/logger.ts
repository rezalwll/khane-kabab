import { createMiddleware } from 'hono/factory';
import type pino from 'pino';
import type { AppVariables } from './request-id.js';
export const loggerMiddleware=(logger:pino.Logger)=>createMiddleware<{Variables:AppVariables}>(async(c,next)=>{const started=performance.now();await next();logger.info({requestId:c.get('requestId'),method:c.req.method,path:c.req.path,status:c.res.status,latencyMs:Math.round((performance.now()-started)*100)/100},'request completed')});
