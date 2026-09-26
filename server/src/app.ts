import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type pino from 'pino';
import type { AppDb } from './db/client.js';
import type { Env } from './config/env.js';
import { couponRoutes } from './modules/coupons/routes.js';
import { healthRoutes } from './modules/health/routes.js';
import { menuRoutes } from './modules/menu/routes.js';
import { orderRoutes } from './modules/orders/routes.js';
import { productRoutes } from './modules/products/routes.js';
import { errorHandler } from './middleware/error-handler.js';
import { loggerMiddleware } from './middleware/logger.js';
import { requestIdMiddleware, type AppVariables } from './middleware/request-id.js';

export function createApp({db,env,logger}:{db:AppDb;env:Env;logger:pino.Logger}){
  const app=new Hono<{Variables:AppVariables}>();app.use('*',requestIdMiddleware);app.use('*',loggerMiddleware(logger));app.use('/api/*',cors({origin:(origin)=>env.corsOrigins.includes(origin)?origin:undefined,allowHeaders:['Content-Type','X-Order-Token','X-Request-Id'],allowMethods:['GET','POST','OPTIONS'],exposeHeaders:['X-Request-Id'],maxAge:600}));app.route('/health',healthRoutes);app.route('/api/v1/menu',menuRoutes(db));app.route('/api/v1/products',productRoutes(db));app.route('/api/v1/coupons',couponRoutes(db));app.route('/api/v1/orders',orderRoutes(db));app.notFound((c)=>c.json({error:{code:'NOT_FOUND',message:'مسیر درخواستی پیدا نشد.',requestId:c.get('requestId')}},404));app.onError(errorHandler(logger));return app;
}
