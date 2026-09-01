import { db } from '@/lib/db';
import { requireSession } from '@/lib/auth';
export default async function Dashboard(){
 const s=await requireSession(); const sql=db();
 const [articles,leads,media,users]=await Promise.all([
  sql`select count(*)::int n from articles where organization_id=${s.organizationId} and deleted_at is null`,
  sql`select count(*)::int n from leads where organization_id=${s.organizationId}`,
  sql`select count(*)::int n from media where organization_id=${s.organizationId} and deleted_at is null`,
  sql`select count(*)::int n from profiles where organization_id=${s.organizationId} and active=true`
 ]);
 return <><div className="dash-head"><div><span className="muted">CMS/ERP editorial</span><h1>Visão geral</h1></div><a className="btn dark" href="/admin/materias/nova">+ Nova matéria</a></div><section className="stats"><div className="stat"><span>Matérias</span><strong>{articles[0].n}</strong></div><div className="stat"><span>Leads</span><strong>{leads[0].n}</strong></div><div className="stat"><span>Mídias</span><strong>{media[0].n}</strong></div><div className="stat"><span>Usuários</span><strong>{users[0].n}</strong></div></section></>;
}
