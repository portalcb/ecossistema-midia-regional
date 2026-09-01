import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const COOKIE = 'mr_session';
function secret(){ const value=process.env.AUTH_SECRET; if(!value) throw new Error('AUTH_SECRET não configurado'); return new TextEncoder().encode(value); }
export async function createSession(user:{id:string;organizationId:string;role:string}){
 const token=await new SignJWT(user).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('8h').sign(secret());
 const store=await cookies(); store.set(COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*8});
}
export async function session(){
 const token=(await cookies()).get(COOKIE)?.value; if(!token) return null;
 try { const {payload}=await jwtVerify(token,secret()); return payload as {id:string;organizationId:string;role:string}; } catch { return null; }
}
export async function destroySession(){ (await cookies()).delete(COOKIE); }
export async function requireSession(){ const s=await session(); if(!s) throw new Error('UNAUTHORIZED'); return s; }
