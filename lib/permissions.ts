export const ROLE_PERMISSIONS = {
  superadmin: ['*'],
  admin: ['dashboard.read','articles.*','media.*','home.*','seo.*','leads.*','users.read','brand.*'],
  editor_chefe: ['dashboard.read','articles.*','media.*','home.read','seo.*'],
  editor_jornalista: ['dashboard.read','articles.create','articles.read','articles.update','media.create','media.read'],
  revisor: ['dashboard.read','articles.read','articles.review','articles.approve'],
  produtor_video: ['dashboard.read','media.*'],
  comercial: ['dashboard.read','leads.*'],
  financeiro: ['dashboard.read'],
  publicidade: ['dashboard.read'],
  suporte: ['dashboard.read','users.read'],
  analista: ['dashboard.read']
} as const;

export function can(role: keyof typeof ROLE_PERMISSIONS, permission: string) {
  const rules = ROLE_PERMISSIONS[role] as readonly string[];
  return rules.includes('*') || rules.includes(permission) || rules.some(r => r.endsWith('.*') && permission.startsWith(r.slice(0,-1)));
}
