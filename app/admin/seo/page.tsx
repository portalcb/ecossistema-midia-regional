import { requireSession } from '@/lib/auth';
import { sql } from '@/lib/db';

export const dynamic='force-dynamic';
export default async function SeoPage(){
 const user=await requireSession();
 const [stats]=await sql`select count(*)::int as total, count(*) filter(where seo_title is not null and seo_title<>'')::int as with_title, count(*) filter(where seo_description is not null and seo_description<>'')::int as with_description, count(*) filter(where canonical_url is not null and canonical_url<>'')::int as with_canonical from articles where organization_id=${user.organizationId} and deleted_at is null`;
 return <section><div className="page-head"><div><span className="eyebrow">SEO · GEO · Discover</span><h1>SEO</h1><p>Visão técnica dos metadados editoriais antes da publicação.</p></div></div><div className="stats"><article><small>Matérias</small><strong>{stats?.total||0}</strong></article><article><small>SEO title</small><strong>{stats?.with_title||0}</strong></article><article><small>Meta description</small><strong>{stats?.with_description||0}</strong></article><article><small>Canonical</small><strong>{stats?.with_canonical||0}</strong></article></div><div className="panel"><h2>Fundação técnica</h2><p>O modelo já armazena título SEO, descrição, canonical, imagem destacada, município, categoria e autoria. Sitemap, robots e metadados públicos serão conectados quando o portal público migrar da versão estática para o CMS.</p></div></section>;
}
