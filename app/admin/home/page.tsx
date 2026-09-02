import { requireSession } from '@/lib/auth';
import { sql } from '@/lib/db';

export const dynamic='force-dynamic';
export default async function HomeAdminPage(){
 const user=await requireSession();
 const blocks=await sql`select id,block_type,title,position,active,starts_at,ends_at from home_blocks where organization_id=${user.organizationId} order by position,id`;
 return <section><div className="page-head"><div><span className="eyebrow">Home Builder</span><h1>Home e aparência</h1><p>Estrutura preparada para ordenar, ativar e programar blocos da página inicial.</p></div></div><div className="panel">{blocks.length===0?<p className="empty">Nenhum bloco dinâmico cadastrado. A Home pública continua preservada até a migração controlada do layout aprovado.</p>:<div className="table-wrap"><table><thead><tr><th>Posição</th><th>Bloco</th><th>Título</th><th>Status</th><th>Programação</th></tr></thead><tbody>{blocks.map((b:any)=><tr key={b.id}><td>{b.position}</td><td><strong>{b.block_type}</strong></td><td>{b.title||'—'}</td><td>{b.active?'Ativo':'Inativo'}</td><td>{b.starts_at||b.ends_at?'Programado':'Sempre'}</td></tr>)}</tbody></table></div>}</div></section>;
}
