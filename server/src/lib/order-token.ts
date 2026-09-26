import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
export const createOrderToken=()=>randomBytes(32).toString('base64url');
export const hashOrderToken=(token:string)=>createHash('sha256').update(token).digest('hex');
export function verifyOrderToken(token:string,expectedHash:string){const actual=Buffer.from(hashOrderToken(token),'hex');const expected=Buffer.from(expectedHash,'hex');return actual.length===expected.length&&timingSafeEqual(actual,expected)}
