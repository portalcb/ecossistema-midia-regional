import { redirect } from 'next/navigation';
import { requireSession } from './auth';
import { sql } from './db';

export const ROLE_PERMISSIONS = {
  superadmin: ['*'],
  admin: [
    'dashboard.read', 'articles.*', 'media.*', 'home.*', 'seo.*', 'leads.*',
    'brand.*', 'newsletter.*', 'automations.*', 'reports.*', 'crm.*',
    'companies.*', 'sponsors.*', 'ads.*', 'projects.*', 'proposals.*',
    'contracts.*', 'subscriptions.*', 'billing.*', 'finance.*', 'commissions.*',
    'streaming.*', 'taxonomy.*', 'users.read', 'settings.read',
  ],
  editor_chefe: [
    'dashboard.read', 'articles.*', 'media.*', 'home.read', 'seo.*',
    'newsletter.*', 'automations.read', 'reports.read', 'taxonomy.read',
  ],
  editor_jornalista: [
    'dashboard.read', 'articles.create', 'articles.read', 'articles.update',
    'media.create', 'media.read', 'taxonomy.read',
  ],
  revisor: [
    'dashboard.read', 'articles.read', 'articles.review', 'articles.approve',
    'media.read', 'taxonomy.read',
  ],
  produtor_video: [
    'dashboard.read', 'media.*', 'streaming.read', 'streaming.create',
    'streaming.update', 'streaming.analytics.read',
  ],
  comercial: [
    'dashboard.read', 'leads.*', 'crm.*', 'companies.*', 'sponsors.*',
    'ads.*', 'projects.*', 'proposals.*', 'contracts.*',
  ],
  financeiro: [
    'dashboard.read', 'finance.*', 'commissions.*', 'billing.read',
    'subscriptions.read', 'reports.read',
  ],
  publicidade: [
    'dashboard.read', 'ads.*', 'sponsors.read', 'companies.read', 'reports.read',
  ],
  suporte: [
    'dashboard.read', 'users.read', 'subscriptions.read', 'billing.read',
    'streaming.access.read',
  ],
  analista: ['dashboard.read', 'reports.read', 'streaming.read', 'streaming.analytics.read'],
} as const;

export type Role = keyof typeof ROLE_PERMISSIONS;

export function can(role: Role, permission: string) {
  const rules = ROLE_PERMISSIONS[role] as readonly string[];
  return rules.includes('*') || rules.includes(permission) || rules.some(
    (rule) => rule.endsWith('.*') && permission.startsWith(rule.slice(0, -1)),
  );
}

const ADMIN_ROUTE_PERMISSIONS = [
  ['/admin/financeiro/relatorio', 'finance.read'],
  ['/admin/streaming/audiencia', 'streaming.analytics.read'],
  ['/admin/streaming/acesso', 'streaming.access.read'],
  ['/admin/streaming', 'streaming.read'],
  ['/admin/checkout', 'billing.read'],
  ['/admin/assinaturas', 'subscriptions.read'],
  ['/admin/assinantes', 'subscriptions.read'],
  ['/admin/planos', 'subscriptions.read'],
  ['/admin/cupons', 'subscriptions.read'],
  ['/admin/financeiro', 'finance.read'],
  ['/admin/comissoes', 'commissions.read'],
  ['/admin/contratos', 'contracts.read'],
  ['/admin/propostas', 'proposals.read'],
  ['/admin/projetos', 'projects.read'],
  ['/admin/publicidade', 'ads.read'],
  ['/admin/patrocinadores', 'sponsors.read'],
  ['/admin/empresas', 'companies.read'],
  ['/admin/crm', 'crm.read'],
  ['/admin/relatorios', 'reports.read'],
  ['/admin/automacoes', 'automations.read'],
  ['/admin/newsletter', 'newsletter.read'],
  ['/admin/youtube', 'media.read'],
  ['/admin/agenda', 'articles.read'],
  ['/admin/editorial', 'articles.read'],
  ['/admin/materias', 'articles.read'],
  ['/admin/midia', 'media.read'],
  ['/admin/home', 'home.read'],
  ['/admin/seo', 'seo.read'],
  ['/admin/leads', 'leads.read'],
  ['/admin/categorias', 'taxonomy.read'],
  ['/admin/municipios', 'taxonomy.read'],
  ['/admin/autores', 'taxonomy.read'],
  ['/admin/usuarios', 'users.read'],
  ['/admin/configuracoes', 'settings.read'],
  ['/admin', 'dashboard.read'],
] as const;

export function permissionForAdminPath(pathname: string) {
  return ADMIN_ROUTE_PERMISSIONS.find(([prefix]) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`),
  )?.[1] ?? null;
}

export async function requirePermission(permission: string) {
  const user = await requireSession();
  const role = String(user.role) as Role;
  if (!ROLE_PERMISSIONS[role] || !can(role, permission)) throw new Error('Permissão insuficiente');
  return user;
}

export async function requireAdminPath(pathname: string) {
  const user = await requireSession();
  const role = String(user.role) as Role;
  const permission = permissionForAdminPath(pathname);
  if (!ROLE_PERMISSIONS[role] || !permission || !can(role, permission)) {
    redirect('/admin?erro=permissao');
  }
  return user;
}

export async function audit(
  user: { id: string; organizationId: string },
  action: string,
  entityType: string,
  entityId?: string | null,
  metadata: Record<string, unknown> = {},
) {
  await sql`insert into audit_log(organization_id,profile_id,action,entity_type,entity_id,metadata) values(${user.organizationId},${user.id},${action},${entityType},${entityId || null},${JSON.stringify(metadata)}::jsonb)`;
}
