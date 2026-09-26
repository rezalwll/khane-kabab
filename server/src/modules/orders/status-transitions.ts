import type { OrderStatus } from '../../db/schema.js';
const allowed:Record<OrderStatus,OrderStatus[]>={submitted:['confirmed','cancelled'],confirmed:['preparing','cancelled'],preparing:['ready','cancelled'],ready:['dispatched','delivered'],dispatched:['delivered'],delivered:[],cancelled:[]};
export const canTransitionOrder=(from:OrderStatus,to:OrderStatus)=>allowed[from].includes(to);
