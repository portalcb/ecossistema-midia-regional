import Link from 'next/link';
import { sql } from '@/lib/db';
import { requireSession } from '@/lib/auth';

export const dynamic='force-dynamic';

export default async function Dashboard(){
  const session=await requireSession();
  const [articles,leads,subscribers,subscriptions,revenue,activity]=await Promise.all([
    sql`select count(*)::int n from articles where organization_id=${session.organizationId} and deleted_at is null`,
    sql`select count(*)::int n from leads where organization_id=${session.organizationId}`,
    sql`select count(*)::int n from subscribers where organization_id=${session.organizationId} and status='active'`,
    sql`select count(*)::int n from subscriptions where organization_id=${session.organizationId} and status='active'`,
    sql`select coalesce(sum(amount),0)::numeric total from financial_entries where organization_id=${session.organizationId} and entry_type='income' and status='paid'`,
    sql`select * from (
      select 'Matéria'::text kind,title::text label,status::text status,created_at from articles where organization_id=${session.organizationId} and deleted_at is null
      union all
      select 'Lead'::text kind,coalesce(nullif(name,''),nullif(email,''),'Novo lead')::text label,status::text status,created_at from leads where organization_id=${session.organizationId}
      union all
      select 'Assinatura'::text kind,coalesce(s.name,'Novo assinante')::text label,sub.status::text status,sub.created_at from subscriptions sub join subscribers s on s.id=sub.subscriber_id where sub.organization_id=${session.organizationId}
    ) recent order by created_at desc limit 7`,
  ]);
  const currency=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(Number(revenue[0]?.total||0));
  const date=new Intl.DateTimeFormat('pt-BR',{weekday:'long',day:'2-digit',month:'long'}).format(new Date());
  return <>
    <div className="dash-head"><div><span className="muted">{date}</span><h1>Visão geral do negócio</h1><p>Conteúdo, comercial, assinaturas e operação em um único workspace.</p></div><Link className="btn dark" href="/admin/materias">＋ Nova matéria</Link></div>
    <section className="stats" aria-label="Indicadores principais">
      <div className="stat"><span>Conteúdos cadastrados</span><strong>{articles[0].n}</strong><small className="positive">● Operação editorial ativa</small></div>
      <div className="stat"><span>Leads no CRM</span><strong>{leads[0].n}</strong><small>Base comercial consolidada</small></div>
      <div className="stat"><span>Assinaturas ativas</span><strong>{subscriptions[0].n}</strong><small>{subscribers[0].n} assinante(s) ativo(s)</small></div>
      <div className="stat"><span>Receita confirmada</span><strong>{currency}</strong><small>Entradas financeiras pagas</small></div>
    </section>
    <section className="erp-dashboard-grid">
      <article className="panel"><div className="section-head"><div><span className="eyebrow">Em tempo real</span><h2>Atividade recente</h2></div><Link href="/admin/relatorios">Ver relatórios →</Link></div>
        {activity.length?<div className="erp-activity-list">{activity.map((item:any,index:number)=><div className="erp-activity" key={`${item.kind}-${item.created_at}-${index}`}><span className="erp-activity-icon">{item.kind==='Matéria'?'M':item.kind==='Lead'?'L':'A'}</span><div><strong>{item.label}</strong><span>{item.kind} · {String(item.status).replaceAll('_',' ')}</span></div><time>{new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short'}).format(new Date(item.created_at))}</time></div>)}</div>:<div className="erp-empty">As primeiras atividades aparecerão aqui.</div>}
      </article>
      <aside className="panel"><span className="eyebrow">Acesso rápido</span><h2>Atalhos do ERP</h2><div className="erp-quick-actions"><Link href="/admin/crm"><b>＋</b><span>Nova oportunidade</span></Link><Link href="/admin/assinantes"><b>◎</b><span>Gerir assinantes</span></Link><Link href="/admin/streaming"><b>▶</b><span>Catálogo premium</span></Link><Link href="/admin/financeiro"><b>R$</b><span>Fluxo financeiro</span></Link></div><div className="erp-progress"><div><span>Fundação operacional</span><strong>Concluída</strong><i/></div></div></aside>
    </section>
  </>;
}
