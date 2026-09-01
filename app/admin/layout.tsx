import Link from 'next/link';
import { requireSession } from '@/lib/auth';

const nav=[['/admin','Visão geral'],['/admin/materias','Matérias'],['/admin/categorias','Categorias'],['/admin/municipios','Municípios'],['/admin/autores','Autores'],['/admin/midia','Biblioteca'],['/admin/home','Home e Aparência'],['/admin/seo','SEO'],['/admin/leads','Leads e CRM'],['/admin/usuarios','Usuários'],['/admin/configuracoes','Configurações']];
export default async function AdminLayout({children}:{children:React.ReactNode}){
 await requireSession();
 return <div className="admin-shell"><aside className="sidebar"><Link className="brand" href="/"><span className="mark">MR</span>GESTÃO</Link>{nav.map(([href,label])=><Link className="side-link" key={href} href={href}>{label}</Link>)}<div className="planned"><span>Streaming</span><small>Planejado</small><span>Publicidade</span><small>Planejado</small><span>Financeiro</span><small>Planejado</small></div></aside><main className="main">{children}</main></div>;
}
