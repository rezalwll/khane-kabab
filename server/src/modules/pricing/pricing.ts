import { ApiError } from '../../lib/errors.js';
import { assertToman } from '../../lib/money.js';

export type PricedOption={id:string;name:string;priceDeltaToman:number;optionGroupId:string};
export type PricedProduct={id:string;title:string;priceToman:number;isActive:boolean;isAvailable:boolean};
export type PricingLineInput={product:PricedProduct;quantity:number;options:PricedOption[];note?:string};
export type PricingCoupon={code:string;type:'percentage'|'fixed';value:number;maxDiscountToman:number|null;minOrderToman:number|null;startsAt:Date|null;endsAt:Date|null;usageLimit:number|null;usageCount:number;isActive:boolean};
export type PricingSettings={defaultDeliveryFeeToman:number;deliveryEnabled:boolean;pickupEnabled:boolean;minimumOrderToman:number|null;ordersEnabled:boolean};

export function calculatePricing(input:{lines:PricingLineInput[];coupon?:PricingCoupon|null;fulfillmentType:'delivery'|'pickup';settings:PricingSettings;now?:Date}){
  const {lines,coupon,fulfillmentType,settings}=input;const now=input.now??new Date();
  if(!settings.ordersEnabled)throw new ApiError(409,'ORDERS_DISABLED','ثبت سفارش در حال حاضر غیرفعال است.');
  if(fulfillmentType==='delivery'&&!settings.deliveryEnabled)throw new ApiError(409,'DELIVERY_DISABLED','ارسال با پیک در حال حاضر فعال نیست.');
  if(fulfillmentType==='pickup'&&!settings.pickupEnabled)throw new ApiError(409,'PICKUP_DISABLED','دریافت حضوری در حال حاضر فعال نیست.');
  const pricedLines=lines.map((line)=>{if(!line.product.isActive||!line.product.isAvailable)throw new ApiError(409,'PRODUCT_UNAVAILABLE','این غذا در حال حاضر موجود نیست.');if(!Number.isInteger(line.quantity)||line.quantity<1||line.quantity>20)throw new ApiError(422,'INVALID_QUANTITY','تعداد هر قلم باید بین ۱ تا ۲۰ باشد.');assertToman(line.product.priceToman);const optionsPerUnit=line.options.reduce((sum,option)=>sum+assertToman(option.priceDeltaToman),0);const lineSubtotalToman=line.product.priceToman*line.quantity;const lineOptionsTotalToman=optionsPerUnit*line.quantity;return {productId:line.product.id,productTitle:line.product.title,unitPriceToman:line.product.priceToman,quantity:line.quantity,options:line.options,note:line.note,lineSubtotalToman,lineOptionsTotalToman,lineTotalToman:lineSubtotalToman+lineOptionsTotalToman}});
  const subtotalToman=pricedLines.reduce((sum,line)=>sum+line.lineTotalToman,0);if(settings.minimumOrderToman!==null&&subtotalToman<settings.minimumOrderToman)throw new ApiError(422,'MINIMUM_ORDER','مبلغ سفارش به حداقل سفارش نرسیده است.');
  let discountToman=0;let couponCode:string|null=null;
  if(coupon){const valid=coupon.isActive&&(!coupon.startsAt||coupon.startsAt<=now)&&(!coupon.endsAt||coupon.endsAt>=now)&&(coupon.usageLimit===null||coupon.usageCount<coupon.usageLimit)&&(coupon.minOrderToman===null||subtotalToman>=coupon.minOrderToman);if(!valid)throw new ApiError(422,'INVALID_COUPON','کد تخفیف معتبر نیست.');discountToman=coupon.type==='percentage'?Math.floor(subtotalToman*coupon.value/100):coupon.value;if(coupon.maxDiscountToman!==null)discountToman=Math.min(discountToman,coupon.maxDiscountToman);discountToman=Math.min(discountToman,subtotalToman);couponCode=coupon.code;}
  const deliveryFeeToman=fulfillmentType==='delivery'?assertToman(settings.defaultDeliveryFeeToman):0;return {lines:pricedLines,subtotalToman,discountToman,deliveryFeeToman,totalToman:subtotalToman-discountToman+deliveryFeeToman,couponCode};
}
