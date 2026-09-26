import { and,eq,inArray } from 'drizzle-orm';
import type { QueryDb } from '../../db/client.js';
import { coupons,optionGroups,options,productOptionGroups,products,restaurantSettings } from '../../db/schema.js';
import { ApiError } from '../../lib/errors.js';
import type { PricingCoupon,PricingLineInput,PricingSettings } from './pricing.js';
import { validateOptionSelection } from './option-validation.js';
import type { PricingRequest } from '../orders/input.js';

export async function resolvePricingContext(db:QueryDb,input:PricingRequest){
  const productIds=[...new Set(input.items.map((item)=>item.productId))];
  const productRows=await db.select({id:products.id,title:products.title,priceToman:products.priceToman,isActive:products.isActive,isAvailable:products.isAvailable}).from(products).where(inArray(products.id,productIds));
  const productMap=new Map(productRows.map((product)=>[product.id,product]));
  const links=await db.select({productId:productOptionGroups.productId,id:optionGroups.id,minSelect:optionGroups.minSelect,maxSelect:optionGroups.maxSelect,isRequired:optionGroups.isRequired}).from(productOptionGroups).innerJoin(optionGroups,and(eq(productOptionGroups.optionGroupId,optionGroups.id),eq(optionGroups.isActive,true))).where(inArray(productOptionGroups.productId,productIds));
  const groupIds=[...new Set(links.map((link)=>link.id))];
  const optionRows=groupIds.length?await db.select({id:options.id,name:options.name,priceDeltaToman:options.priceDeltaToman,optionGroupId:options.optionGroupId,isActive:options.isActive}).from(options).where(inArray(options.optionGroupId,groupIds)):[];
  const optionMap=new Map(optionRows.map((option)=>[option.id,option]));
  const lines:PricingLineInput[]=input.items.map((item)=>{const product=productMap.get(item.productId);if(!product)throw new ApiError(404,'PRODUCT_NOT_FOUND','یکی از غذاهای انتخاب‌شده پیدا نشد.');const groups=links.filter((link)=>link.productId===item.productId);validateOptionSelection(groups,optionRows,item.optionIds);return {product,quantity:item.quantity,options:item.optionIds.map((id)=>{const option=optionMap.get(id);if(!option)throw new ApiError(422,'INVALID_OPTION','افزودنی انتخاب‌شده معتبر نیست.');return option}),note:item.note}});
  const [settingsRow]=await db.select().from(restaurantSettings).limit(1);if(!settingsRow)throw new ApiError(503,'SETTINGS_MISSING','تنظیمات رستوران آماده نیست.');
  const settings:PricingSettings={defaultDeliveryFeeToman:settingsRow.defaultDeliveryFeeToman,deliveryEnabled:settingsRow.deliveryEnabled,pickupEnabled:settingsRow.pickupEnabled,minimumOrderToman:settingsRow.minimumOrderToman,ordersEnabled:settingsRow.ordersEnabled};
  let coupon:PricingCoupon|null=null;if(input.couponCode){const normalized=input.couponCode.trim().toUpperCase();const [row]=await db.select().from(coupons).where(eq(coupons.code,normalized)).limit(1);if(!row)throw new ApiError(422,'INVALID_COUPON','کد تخفیف معتبر نیست.');coupon=row;}
  return {lines,settings,coupon};
}
