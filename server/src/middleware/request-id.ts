import { randomUUID } from 'node:crypto';
import { createMiddleware } from 'hono/factory';
export type AppVariables={requestId:string};
const sane=/^[A-Za-z0-9._-]{1,80}$/;
export const requestIdMiddleware=createMiddleware<{Variables:AppVariables}>(async(c,next)=>{const incoming=c.req.header('x-request-id');const requestId=incoming&&sane.test(incoming)?incoming:randomUUID();c.set('requestId',requestId);c.header('x-request-id',requestId);await next()});
