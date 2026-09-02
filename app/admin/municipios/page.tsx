import { sql } from '../../../lib/db';
import { requireSession } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

export default async function MunicipiosPage() {
  const user = await requireSession();
  const municipios = await sql`
    select id, name, state, slug
    from municipalities
    where organization_id = ${user.organizationId}
    order by name asc
  `;

  return <section><div className="page-head"><div><span className="eyebrow">Cobertura regional</span><h1>Municípios</h1><p>Base territorial para conteúdo, SEO local e organização editorial.</p></div></div><div className="panel">
    {municipios.length === 0 ? <p className="empty">Nenhum município cadastrado ainda.</p> : <div className="table-wrap"><table><thead><tr><th>Município</th><th>UF</th><th>Slug</th></tr></thead><tbody>{municipios.map((item:any)=><tr key={item.id}><td><strong>{item.name}</strong></td><td>{item.state}</td><td>{item.slug}</td></tr>)}</tbody></table></div>}
  </div></section>;
}
