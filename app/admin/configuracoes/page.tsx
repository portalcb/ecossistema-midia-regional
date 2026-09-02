import { requireSession } from '@/lib/auth';
import { sql } from '@/lib/db';

export const dynamic='force-dynamic';
export default async function ConfiguracoesPage(){
 const user=await requireSession();
 const [brand]=await sql`select name,tagline,logo_url,primary_color,secondary_color,accent_color,updated_at from brand_settings where organization_id=${user.organizationId} limit 1`;
 return <section><div className="page-head"><div><span className="eyebrow">Identidade</span><h1>Marca e configurações</h1><p>Dados centrais da marca usados pelo portal e pelo painel.</p></div></div><div className="panel"><div className="settings-grid"><div><small>Nome</small><h2>{brand?.name||'Demonstração — editar no painel'}</h2></div><div><small>Tagline</small><p>{brand?.tagline||'Não configurada'}</p></div><div><small>Logo</small><p>{brand?.logo_url||'Ainda não enviada'}</p></div><div><small>Cores</small><p>{brand?.primary_color||'#07182D'} · {brand?.secondary_color||'#123B63'} · {brand?.accent_color||'#C79A45'}</p></div></div><p className="empty">A edição persistente será habilitada neste módulo após a camada de autorização de escrita e auditoria.</p></div></section>;
}
