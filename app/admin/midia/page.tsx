import { requireSession } from '@/lib/auth';
import { sql } from '@/lib/db';

export const dynamic='force-dynamic';
export default async function MidiaPage(){
 const user=await requireSession();
 const media=await sql`select id,url,filename,mime_type,alt_text,caption,credit,folder,created_at from media where organization_id=${user.organizationId} and deleted_at is null order by created_at desc limit 100`;
 return <section><div className="page-head"><div><span className="eyebrow">Biblioteca</span><h1>Mídia</h1><p>Imagens e arquivos com metadados editoriais e de acessibilidade.</p></div></div><div className="panel">{media.length===0?<p className="empty">Biblioteca vazia. Upload real será ativado somente com storage configurado e validação segura de arquivo; não será criado um upload fictício.</p>:<div className="table-wrap"><table><thead><tr><th>Arquivo</th><th>Tipo</th><th>ALT</th><th>Crédito</th><th>Pasta</th></tr></thead><tbody>{media.map((m:any)=><tr key={m.id}><td><strong>{m.filename}</strong><br/><small>{m.caption||'Sem legenda'}</small></td><td>{m.mime_type||'—'}</td><td>{m.alt_text||'Pendente'}</td><td>{m.credit||'—'}</td><td>{m.folder||'Geral'}</td></tr>)}</tbody></table></div>}</div></section>;
}
