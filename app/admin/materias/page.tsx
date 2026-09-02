import Link from 'next/link';
import { sql } from '@/lib/db';
import { requireSession } from '@/lib/auth';

export default async function Articles(){
  const session=await requireSession();
  const rows=await sql`select id,title,slug,status,updated_at from articles where organization_id=${session.organizationId} and deleted_at is null order by updated_at desc limit 100`;
  return <section className="panel"><div className="section-head"><div><span className="muted">Fluxo editorial</span><h1>Matérias</h1></div><Link className="btn dark" href="/admin/materias/nova">+ Nova matéria</Link></div><table className="table"><thead><tr><th>Título</th><th>Status</th><th>Atualização</th></tr></thead><tbody>{rows.map((item:any)=><tr key={item.id}><td><Link href={`/admin/materias/${item.id}`}>{item.title}</Link></td><td><span className="status">{item.status}</span></td><td>{new Date(item.updated_at).toLocaleDateString('pt-BR')}</td></tr>)}</tbody></table>{!rows.length&&<p className="muted">Nenhuma matéria cadastrada.</p>}</section>;
}
