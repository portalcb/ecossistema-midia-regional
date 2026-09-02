import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { createHash, randomUUID } from 'crypto';
import { redirect } from 'next/navigation';
import { bindTenantContext, db } from './db';

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
  store.set(COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:60*60*HOURS,priority:'high'});
}

export async function session() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const {payload} = await jwtVerify(token,secret());
    const s = payload as {id:string;organizationId:string;role:string;sid:string};
    const sql = db();
    if(!s.id||!s.organizationId||!s.role||!s.sid)return null;
    const rows = await sql`SELECT se.id FROM sessions se JOIN profiles p ON p.id=se.profile_id AND p.organization_id=se.organization_id JOIN user_roles ur ON ur.profile_id=p.id JOIN roles r ON r.id=ur.role_id AND r.organization_id=se.organization_id WHERE se.id=${s.sid} AND se.profile_id=${s.id} AND se.organization_id=${s.organizationId} AND r.slug=${s.role} AND p.active=true AND se.token_hash=${hashToken(token)} AND se.revoked_at IS NULL AND se.expires_at>now() LIMIT 1`;
    if (!rows.length) return null;
    bindTenantContext({organizationId:s.organizationId,profileId:s.id,role:s.role});
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
