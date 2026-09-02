'use server';
import { createHmac } from 'node:crypto';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/password';
import { createSession } from '@/lib/auth';

const DUMMY_PASSWORD_HASH='00000000000000000000000000000000:6aecd6ad6c94ef43ca3435acbc08bf9a2eb0c9502ef46fae86340b2cb3f7bf42e438f1312ec09d7c3a62647beaa6d42a4f9772e8c0875f28074022c3f5c70605';

function requestIpHash(value:string){
  const secret=process.env.AUTH_SECRET;
  if(!secret||secret.length<32)throw new Error('AUTH_SECRET não configurado ou fraco');
  return createHmac('sha256',secret).update(value||'unknown').digest('hex');
}

export async function loginAction(formData:FormData) {
  const email=String(formData.get('email')||'').trim().toLowerCase();
  const password=String(formData.get('password')||'');
  if(!email||!password) redirect('/login?erro=campos');
  const sql=db();
  const forwarded=(await headers()).get('x-forwarded-for')?.split(',')[0]?.trim()||'';
  const ipHash=requestIpHash(forwarded);
  const recent=await sql`SELECT count(*) filter(where email=${email})::int email_attempts,count(*) filter(where ip_hash=${ipHash})::int ip_attempts FROM login_attempts WHERE successful=false AND created_at>now()-interval '15 minutes' AND (email=${email} OR ip_hash=${ipHash})`;
  if(Number(recent[0]?.email_attempts||0)>=5||Number(recent[0]?.ip_attempts||0)>=25) redirect('/login?erro=limite');
  const rows=await sql`SELECT p.id,p.organization_id,p.password_hash,r.slug role FROM profiles p JOIN user_roles ur ON ur.profile_id=p.id JOIN roles r ON r.id=ur.role_id AND r.organization_id=p.organization_id WHERE lower(p.email)=${email} AND p.active=true ORDER BY CASE r.slug WHEN 'superadmin' THEN 0 WHEN 'admin' THEN 1 WHEN 'editor_chefe' THEN 2 ELSE 3 END,r.slug LIMIT 1`;
  const user=rows[0];
  const ok=verifyPassword(password,String(user?.password_hash||DUMMY_PASSWORD_HASH))&&Boolean(user?.password_hash);
  await sql`INSERT INTO login_attempts(email,ip_hash,successful) VALUES (${email},${ipHash},${ok})`;
  if(!ok) redirect('/login?erro=credenciais');
  await createSession({id:String(user.id),organizationId:String(user.organization_id),role:String(user.role)});
  redirect('/admin');
}
