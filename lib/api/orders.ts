import { apiRequest } from './client';
import type { ApiOrderLine } from './coupons';
export type CreateApiOrder={customer:{name:string;mobile:string};fulfillmentType:'delivery'|'pickup';address?:{address?:string;plaque?:string;unit?:string;note?:string};requestedTime?:string;paymentMethod:'online'|'on_delivery';couponCode?:string;customerNote?:string;items:ApiOrderLine[]};
export type ApiOrderSummary={publicNumber:string;trackingToken?:string;status:string;createdAt:string;fulfillmentType:'delivery'|'pickup';pricing:{subtotalToman:number;discountToman:number;deliveryFeeToman:number;totalToman:number;couponCode:string|null}};
export const createOrder=(body:CreateApiOrder)=>apiRequest<ApiOrderSummary>('/api/v1/orders',{method:'POST',body:JSON.stringify(body)});
export const getOrder=(publicNumber:string,trackingToken:string)=>apiRequest<ApiOrderSummary>(`/api/v1/orders/${encodeURIComponent(publicNumber)}`,{headers:{'X-Order-Token':trackingToken}});
