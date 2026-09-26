import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import type { AppDb } from '../../db/client.js';
import { coupons } from '../../db/schema.js';
import { ApiError } from '../../lib/errors.js';
import { pricingRequestSchema } from '../orders/input.js';
import { calculatePricing } from '../pricing/pricing.js';
import { resolvePricingContext } from '../pricing/resolve-context.js';
export function couponRoutes(db:AppDb){return new Hono().post('/validate',async(c)=>{const parsed=pricingRequestSchema.safeParse(await c.req.json().catch(()=>null));if(!parsed.success)throw new ApiError(422,'VALIDATION_ERROR','اطلاعات کد تخفیف معتبر نیست.');if(!parsed.data.couponCode)throw new ApiError(422,'INVALID_COUPON','کد تخفیف وارد نشده است.');const normalizedCode=parsed.data.couponCode.trim().toUpperCase();const context=await resolvePricingContext(db,{...parsed.data,couponCode:undefined});const base=calculatePricing({...context,fulfillmentType:parsed.data.fulfillmentType});const [coupon]=await db.select().from(coupons).where(eq(coupons.code,normalizedCode)).limit(1);if(!coupon)return c.json({valid:false,normalizedCode,subtotalToman:base.subtotalToman,discountToman:0,reason:'کد تخفیف معتبر نیست.'});try{const pricing=calculatePricing({...context,coupon,fulfillmentType:parsed.data.fulfillmentType});return c.json({valid:true,normalizedCode,subtotalToman:pricing.subtotalToman,discountToman:pricing.discountToman})}catch(error){if(error instanceof ApiError&&error.code==='INVALID_COUPON')return c.json({valid:false,normalizedCode,subtotalToman:base.subtotalToman,discountToman:0,reason:error.message});throw error}})}
