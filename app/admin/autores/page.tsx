import { sql } from '../../../lib/db';
import { requireSession } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

export default async function AutoresPage() {
  const user = await requireSession();
  const autores = await sql`
    select id, name, bio, created_at
    from authors
    where organization_id = ${user.organizationId}
    order by name asc
  `;

  return <section><div className="page-head"><div><span className="eyebrow">E-E-A-T</span><h1>Autores</h1><p>Perfis editoriais para autoria, credibilidade e transparência.</p></div></div><div className="panel">
    {autores.length === 0 ? <p className="empty">Nenhum autor cadastrado ainda.</p> : <div className="table-wrap"><table><thead><tr><th>Autor</th><th>Biografia</th><th>Criado em</th></tr></thead><tbody>{autores.map((item:any)=><tr key={item.id}><td><strong>{item.name}</strong></td><td>{item.bio || '—'}</td><td>{new Date(item.created_at).toLocaleDateString('pt-BR')}</td></tr>)}</tbody></table></div>}
  </div></section>;
}
