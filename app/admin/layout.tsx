import Link from 'next/link';
import { headers } from 'next/headers';
import { can, requireAdminPath, Role } from '@/lib/permissions';

const nav = [
  ['/admin', 'Visão geral', 'dashboard.read'],
  ['/admin/materias', 'Matérias', 'articles.read'],
  ['/admin/editorial', 'Kanban Editorial', 'articles.read'],
  ['/admin/agenda', 'Agenda', 'articles.read'],
  ['/admin/youtube', 'YouTube', 'media.read'],
  ['/admin/newsletter', 'Newsletter', 'newsletter.read'],
  ['/admin/automacoes', 'Automações', 'automations.read'],
  ['/admin/relatorios', 'Relatórios', 'reports.read'],
  ['/admin/crm', 'CRM Comercial', 'crm.read'],
  ['/admin/empresas', 'Empresas e Parceiros', 'companies.read'],
  ['/admin/patrocinadores', 'Patrocinadores', 'sponsors.read'],
  ['/admin/publicidade', 'Publicidade', 'ads.read'],
  ['/admin/projetos', 'Projetos', 'projects.read'],
  ['/admin/propostas', 'Propostas', 'proposals.read'],
  ['/admin/contratos', 'Contratos', 'contracts.read'],
  ['/admin/planos', 'Planos', 'subscriptions.read'],
  ['/admin/assinantes', 'Assinantes', 'subscriptions.read'],
  ['/admin/assinaturas', 'Assinaturas', 'subscriptions.read'],
  ['/admin/cupons', 'Cupons', 'subscriptions.read'],
  ['/admin/checkout', 'Checkout e Pedidos', 'billing.read'],
  ['/admin/financeiro', 'Financeiro', 'finance.read'],
  ['/admin/comissoes', 'Comissões', 'commissions.read'],
  ['/admin/streaming', 'Streaming Premium', 'streaming.read'],
  ['/admin/streaming/acesso', 'Acesso Premium', 'streaming.access.read'],
  ['/admin/streaming/audiencia', 'Audiência Streaming', 'streaming.analytics.read'],
  ['/admin/categorias', 'Categorias', 'taxonomy.read'],
  ['/admin/municipios', 'Municípios', 'taxonomy.read'],
  ['/admin/autores', 'Autores', 'taxonomy.read'],
  ['/admin/midia', 'Biblioteca', 'media.read'],
  ['/admin/home', 'Home e Aparência', 'home.read'],
  ['/admin/seo', 'SEO', 'seo.read'],
  ['/admin/leads', 'Leads', 'leads.read'],
  ['/admin/usuarios', 'Usuários', 'users.read'],
  ['/admin/configuracoes', 'Configurações', 'settings.read'],
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get('x-admin-path') || '/admin';
  const user = await requireAdminPath(pathname);
  const role = String(user.role) as Role;
  const allowedNav = nav.filter(([, , permission]) => can(role, permission));

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <Link className="brand" href="/"><span className="mark">MR</span>GESTÃO</Link>
        <nav>{allowedNav.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}</nav>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
