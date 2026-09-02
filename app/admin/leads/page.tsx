import { sql } from '../../../lib/db';
import { requireSession } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

export default async function LeadsPage() {
  const user = await requireSession();
  const leads = await sql`
    select id, name, email, phone, source, status, created_at
    from leads
    where organization_id = ${user.organizationId}
    order by created_at desc
    limit 100
  `;

  return <section><div className="page-head"><div><span className="eyebrow">Comercial</span><h1>Leads</h1><p>Contatos recebidos pelos canais públicos do ecossistema.</p></div></div><div className="panel">
    {leads.length === 0 ? <p className="empty">Nenhum lead recebido ainda.</p> : <div className="table-wrap"><table><thead><tr><th>Contato</th><th>Telefone</th><th>Origem</th><th>Status</th><th>Data</th></tr></thead><tbody>{leads.map((item:any)=><tr key={item.id}><td><strong>{item.name}</strong><br/><small>{item.email || '—'}</small></td><td>{item.phone || '—'}</td><td>{item.source || '—'}</td><td>{item.status}</td><td>{new Date(item.created_at).toLocaleDateString('pt-BR')}</td></tr>)}</tbody></table></div>}
  </div></section>;
}
