import { randomInt } from 'node:crypto';
export function orderNumberCandidate(now=new Date()){const date=now.toISOString().slice(2,10).replaceAll('-','');return `KT-${date}-${randomInt(1000,10000)}`}
export async function createUniqueOrderNumber(exists:(value:string)=>Promise<boolean>,attempts=10){for(let i=0;i<attempts;i++){const value=orderNumberCandidate();if(!await exists(value))return value}throw new Error('Unable to allocate a unique order number')}
