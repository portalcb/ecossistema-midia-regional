import { sql } from '../../../lib/db';
import { requireSession } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

export default async function CategoriasPage() {
  const user = await requireSession();
  const categorias = await sql`
    select id, name, slug, created_at
    from categories
    where organization_id = ${user.organizationId}
    order by name asc
  `;

  return (
    <section>
      <div className="page-head">
        <div><span className="eyebrow">Editorial</span><h1>Categorias</h1><p>Organize as editorias e pilares de conteúdo do portal.</p></div>
      </div>
      <div className="panel">
        {categorias.length === 0 ? <p className="empty">Nenhuma categoria cadastrada ainda.</p> : (
          <div className="table-wrap"><table><thead><tr><th>Categoria</th><th>Slug</th><th>Criada em</th></tr></thead><tbody>
            {categorias.map((item: any) => <tr key={item.id}><td><strong>{item.name}</strong></td><td>{item.slug}</td><td>{new Date(item.created_at).toLocaleDateString('pt-BR')}</td></tr>)}
          </tbody></table></div>
        )}
      </div>
    </section>
  );
}
