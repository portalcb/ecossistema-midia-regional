import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
export function hashPassword(password:string){const salt=randomBytes(16).toString('hex');const hash=scryptSync(password,salt,64).toString('hex');return `${salt}:${hash}`}
export function verifyPassword(password:string,stored:string){try{const [salt,hash]=stored.split(':');if(!salt||!hash||!/^[a-f0-9]{128}$/i.test(hash))return false;const expected=Buffer.from(hash,'hex');const actual=scryptSync(password,salt,64);return expected.length===actual.length&&timingSafeEqual(expected,actual)}catch{return false}}
