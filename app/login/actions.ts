'use server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/password';
import { createSession } from '@/lib/auth';

export async function loginAction(formData:FormData) {
  const email=String(formData.get('email')||'').trim().toLowerCase();
  const password=String(formData.get('password')||'');
  if(!email||!password) redirect('/login?erro=campos');
  const sql=db();
  const recent=await sql`SELECT count(*)::int attempts FROM login_attempts WHERE email=${email} AND successful=false AND created_at>now()-interval '15 minutes'`;
  if(Number(recent[0]?.attempts||0)>=5) redirect('/login?erro=limite');
  const rows=await sql`SELECT p.id,p.organization_id,p.password_hash,r.slug role FROM profiles p JOIN user_roles ur ON ur.profile_id=p.id JOIN roles r ON r.id=ur.role_id WHERE lower(p.email)=${email} AND p.active=true ORDER BY CASE WHEN r.slug='superadmin' THEN 0 ELSE 1 END LIMIT 1`;
  const user=rows[0];
  const ok=Boolean(user?.password_hash&&verifyPassword(password,user.password_hash));
  await sql`INSERT INTO login_attempts(email,successful) VALUES (${email},${ok})`;
  if(!ok) redirect('/login?erro=credenciais');
  await createSession({id:String(user.id),organizationId:String(user.organization_id),role:String(user.role)});
  redirect('/admin');
}
