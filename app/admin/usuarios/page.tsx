import { requireSession } from '@/lib/auth';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function UsuariosPage(){
 const user=await requireSession();
 const users=await sql`
  select p.id,p.name,p.email,p.active,p.created_at,
    coalesce(string_agg(r.name, ', ' order by r.name),'Sem perfil') as roles
  from profiles p
  left join user_roles ur on ur.profile_id=p.id
  left join roles r on r.id=ur.role_id and r.organization_id=p.organization_id
  where p.organization_id=${user.organizationId}
  group by p.id,p.name,p.email,p.active,p.created_at
  order by p.created_at asc`;
 const roles=await sql`select id,name,slug from roles where organization_id=${user.organizationId} order by name`;
 return <section><div className="page-head"><div><span className="eyebrow">Acesso e segurança</span><h1>Usuários e permissões</h1><p>Equipe, perfis de acesso e isolamento por organização.</p></div></div><div className="panel"><h2>Equipe</h2>{users.length===0?<p className="empty">Nenhum usuário cadastrado.</p>:<div className="table-wrap"><table><thead><tr><th>Usuário</th><th>E-mail</th><th>Perfil</th><th>Status</th></tr></thead><tbody>{users.map((item:any)=><tr key={item.id}><td><strong>{item.name}</strong></td><td>{item.email}</td><td>{item.roles}</td><td>{item.active?'Ativo':'Inativo'}</td></tr>)}</tbody></table></div>}</div><div className="panel"><h2>Perfis disponíveis</h2>{roles.length===0?<p className="empty">Nenhum perfil configurado.</p>:<div className="table-wrap"><table><thead><tr><th>Perfil</th><th>Identificador</th></tr></thead><tbody>{roles.map((role:any)=><tr key={role.id}><td><strong>{role.name}</strong></td><td>{role.slug}</td></tr>)}</tbody></table></div>}</div></section>;
}
