import Link from 'next/link';
import { headers } from 'next/headers';
import { can, requireAdminPath, Role } from '@/lib/permissions';
import { sql } from '@/lib/db';
import AdminSearch from './AdminSearch';
import './admin.css';

const navGroups = [
  { label: 'Workspace', items: [['/admin', 'Visão geral', 'dashboard.read', 'dashboard']] },
  { label: 'Conteúdo & audiência', items: [
    ['/admin/materias', 'Matérias', 'articles.read', 'document'], ['/admin/editorial', 'Kanban editorial', 'articles.read', 'board'],
    ['/admin/agenda', 'Agenda', 'articles.read', 'calendar'], ['/admin/youtube', 'YouTube', 'media.read', 'video'],
    ['/admin/newsletter', 'Newsletter', 'newsletter.read', 'mail'], ['/admin/automacoes', 'Automações', 'automations.read', 'spark'],
    ['/admin/relatorios', 'Relatórios', 'reports.read', 'chart'],
  ]},
  { label: 'Comercial', items: [
    ['/admin/crm', 'CRM & Pipeline', 'crm.read', 'pipeline'], ['/admin/empresas', 'Empresas e parceiros', 'companies.read', 'building'],
    ['/admin/patrocinadores', 'Patrocinadores', 'sponsors.read', 'star'], ['/admin/publicidade', 'Publicidade', 'ads.read', 'megaphone'],
    ['/admin/projetos', 'Projetos', 'projects.read', 'folder'], ['/admin/propostas', 'Propostas', 'proposals.read', 'document'],
    ['/admin/contratos', 'Contratos', 'contracts.read', 'shield'],
  ]},
  { label: 'Receita & financeiro', items: [
    ['/admin/planos', 'Planos', 'subscriptions.read', 'layers'], ['/admin/assinantes', 'Assinantes', 'subscriptions.read', 'users'],
    ['/admin/assinaturas', 'Assinaturas', 'subscriptions.read', 'refresh'], ['/admin/cupons', 'Cupons', 'subscriptions.read', 'ticket'],
    ['/admin/checkout', 'Checkout e pedidos', 'billing.read', 'cart'], ['/admin/financeiro', 'Financeiro', 'finance.read', 'wallet'],
    ['/admin/comissoes', 'Comissões', 'commissions.read', 'percent'],
  ]},
  { label: 'Streaming premium', items: [
    ['/admin/streaming', 'Catálogo', 'streaming.read', 'play'], ['/admin/streaming/acesso', 'Acesso premium', 'streaming.access.read', 'key'],
    ['/admin/streaming/audiencia', 'Audiência', 'streaming.analytics.read', 'activity'],
  ]},
  { label: 'Operação & sistema', items: [
    ['/admin/categorias', 'Categorias', 'taxonomy.read', 'tag'], ['/admin/municipios', 'Municípios', 'taxonomy.read', 'pin'],
    ['/admin/autores', 'Autores', 'taxonomy.read', 'pen'], ['/admin/midia', 'Biblioteca de mídia', 'media.read', 'image'],
    ['/admin/home', 'Home e aparência', 'home.read', 'layout'], ['/admin/seo', 'SEO', 'seo.read', 'search'],
    ['/admin/leads', 'Leads', 'leads.read', 'target'], ['/admin/usuarios', 'Usuários e acessos', 'users.read', 'lock'],
    ['/admin/configuracoes', 'Configurações', 'settings.read', 'settings'],
  ]},
] as const;

function NavIcon({name}:{name:string}){
  const paths:Record<string,React.ReactNode>={
    dashboard:<><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
    document:<><path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6M9 13h8M9 17h8"/></>,
    calendar:<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    chart:<><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
    users:<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    play:<><rect x="3" y="3" width="18" height="18" rx="4"/><path d="m10 8 6 4-6 4z"/></>,
    settings:<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l-2.83 2.83a1.7 1.7 0 0 0-1.88-.34A1.7 1.7 0 0 0 14 21h-4a1.7 1.7 0 0 0-1-1.63 1.7 1.7 0 0 0-1.88.34l-2.83-2.83A1.7 1.7 0 0 0 4.63 15 1.7 1.7 0 0 0 3 14v-4a1.7 1.7 0 0 0 1.63-1 1.7 1.7 0 0 0-.34-1.88l2.83-2.83A1.7 1.7 0 0 0 9 4.63 1.7 1.7 0 0 0 10 3h4a1.7 1.7 0 0 0 1 1.63 1.7 1.7 0 0 0 1.88-.34l2.83 2.83A1.7 1.7 0 0 0 19.37 9 1.7 1.7 0 0 0 21 10v4a1.7 1.7 0 0 0-1.6 1z"/></>,
  };
  return <svg className="admin-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]||<><circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8"/></>}</svg>;
}

function isActive(pathname:string,href:string){return href==='/admin'?pathname==='/admin':pathname===href||pathname.startsWith(`${href}/`)}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname=(await headers()).get('x-admin-path')||'/admin';
  const user=await requireAdminPath(pathname);
  const role=String(user.role) as Role;
  const [[profile],[brand]]=await Promise.all([
    sql`select name,email from profiles where id=${user.id} and organization_id=${user.organizationId} limit 1`,
    sql`select name from brand_settings where organization_id=${user.organizationId} limit 1`,
  ]);
  const personName=String(profile?.name||'Superadministrador');
  const brandName=String(brand?.name||'Mídia Regional');
  const initials=personName.split(/\s+/).slice(0,2).map((part:string)=>part[0]).join('').toUpperCase();
  const searchItems=navGroups.flatMap(group=>group.items.filter(([, ,permission])=>can(role,permission)).map(([href,label])=>({href,label,group:group.label})));
  return <div className="admin-shell">
    <aside className="admin-side">
      <div className="admin-brand-row"><Link className="admin-brand" href="/admin"><span className="admin-brand-mark">MR</span><span><strong>Mídia Regional</strong><small>ERP Premium</small></span></Link><span className="admin-plan-badge">PRO</span></div>
      <div className="admin-workspace"><span>Workspace</span><strong>{brandName}</strong><small><i/> Pré-produção</small></div>
      <nav className="admin-nav" aria-label="Navegação principal">{navGroups.map(group=>{const items=group.items.filter(([, ,permission])=>can(role,permission));if(!items.length)return null;return <section className="admin-nav-group" key={group.label}><h2>{group.label}</h2>{items.map(([href,label,,icon])=><Link key={href} href={href} className={isActive(pathname,href)?'active':''}><NavIcon name={icon}/><span>{label}</span>{isActive(pathname,href)&&<b/>}</Link>)}</section>})}</nav>
      <div className="admin-side-footer"><div className="admin-avatar">{initials}</div><div><strong>{personName}</strong><span>{role==='superadmin'?'Superadministrador':role.replaceAll('_',' ')}</span></div><Link href="/admin/logout" title="Sair" aria-label="Sair do painel">↗</Link></div>
    </aside>
    <div className="admin-stage"><header className="admin-topbar"><div className="admin-topbar-title"><span>Central de gestão</span><strong>{brandName}</strong></div><AdminSearch items={searchItems}/><div className="admin-top-actions"><span className="admin-status"><i/> Sistema operacional</span><button type="button" aria-label="Notificações" title="Nenhuma notificação pendente">◇</button><div className="admin-avatar small">{initials}</div></div></header><main className="admin-main">{children}</main></div>
  </div>;
}
