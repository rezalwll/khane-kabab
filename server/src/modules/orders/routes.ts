import { Hono } from 'hono';
import type { AppDb } from '../../db/client.js';
import { ApiError } from '../../lib/errors.js';
import { createOrderSchema } from './input.js';
import { createOrder,getOrder } from './service.js';
export function orderRoutes(db:AppDb){return new Hono().post('/',async(c)=>{const parsed=createOrderSchema.safeParse(await c.req.json().catch(()=>null));if(!parsed.success)throw new ApiError(422,'VALIDATION_ERROR',parsed.error.issues[0]?.message??'اطلاعات سفارش معتبر نیست.');const order=await createOrder(db,parsed.data);return c.json(order,201)}).get('/:publicNumber',async(c)=>c.json(await getOrder(db,c.req.param('publicNumber'),c.req.header('x-order-token'))))}
