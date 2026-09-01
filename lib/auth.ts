import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { createHash, randomUUID } from 'crypto';
import { redirect } from 'next/navigation';
import { db } from './db';

const COOKIE = 'mr_session';
const HOURS = 8;

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) throw new Error('AUTH_SECRET não configurado ou fraco');
  return new TextEncoder().encode(value);
}
function hashToken(token: string) { return createHash('sha256').update(token).digest('hex'); }

export async function createSession(user:{id:string;organizationId:string;role:string}) {
  const sid = randomUUID();
  const token = await new SignJWT({...user,sid}).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime(`${HOURS}h`).sign(secret());
  const sql = db();
  await sql`INSERT INTO sessions (id,organization_id,profile_id,token_hash,expires_at) VALUES (${sid},${user.organizationId},${user.id},${hashToken(token)},now()+interval '8 hours')`;
  const store = await cookies();
  store.set(COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*HOURS});
}

export async function session() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const {payload} = await jwtVerify(token,secret());
    const s = payload as {id:string;organizationId:string;role:string;sid:string};
    const sql = db();
    const rows = await sql`SELECT id FROM sessions WHERE id=${s.sid} AND token_hash=${hashToken(token)} AND revoked_at IS NULL AND expires_at>now() LIMIT 1`;
    if (!rows.length) return null;
    return s;
  } catch { return null; }
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) {
    try { const {payload}=await jwtVerify(token,secret()); const sid=String(payload.sid||''); if(sid) await db()`UPDATE sessions SET revoked_at=now() WHERE id=${sid}`; } catch {}
  }
  store.delete(COOKIE);
}

export async function requireSession() {
  const s = await session();
  if (!s) redirect('/login');
  return s;
}
