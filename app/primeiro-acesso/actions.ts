'use server';
import { createHash } from 'crypto';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/password';

export async function setInitialPassword(formData:FormData){
 const token=String(formData.get('token')||'');
 const password=String(formData.get('password')||'');
 const confirm=String(formData.get('confirm')||'');
 if(password.length<12) redirect(`/primeiro-acesso?token=${encodeURIComponent(token)}&erro=curta`);
 if(password!==confirm) redirect(`/primeiro-acesso?token=${encodeURIComponent(token)}&erro=confirmacao`);
 const tokenHash=createHash('sha256').update(token).digest('hex');
 const sql=db();
 const rows=await sql`SELECT t.id,p.id profile_id FROM password_setup_tokens t JOIN profiles p ON p.id=t.profile_id WHERE t.token_hash=${tokenHash} AND t.used_at IS NULL AND t.expires_at>now() AND p.active=true LIMIT 1`;
 if(!rows.length) redirect('/primeiro-acesso?erro=token');
 const row=rows[0];
 const passwordHash=hashPassword(password);
 await sql.begin(async tx=>{await tx`UPDATE profiles SET password_hash=${passwordHash},updated_at=now() WHERE id=${row.profile_id}`;await tx`UPDATE password_setup_tokens SET used_at=now() WHERE id=${row.id}`;await tx`UPDATE sessions SET revoked_at=now() WHERE profile_id=${row.profile_id} AND revoked_at IS NULL`;});
 redirect('/login?senha=criada');
}
