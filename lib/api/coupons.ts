import { apiRequest } from './client';
export type ApiOrderLine={productId:string;quantity:number;optionIds:string[];note?:string};
export type CouponValidation={valid:boolean;normalizedCode:string;subtotalToman:number;discountToman:number;reason?:string};
export const validateCoupon=(body:{couponCode:string;fulfillmentType:'delivery'|'pickup';items:ApiOrderLine[]})=>apiRequest<CouponValidation>('/api/v1/coupons/validate',{method:'POST',body:JSON.stringify(body)});
